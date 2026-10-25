package com.kh.totalproject.github;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.totalproject.exception.CodeReviewException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.List;

import static com.kh.totalproject.github.GithubModels.*;

/** Request/background-run lifecycle for one analysis -- claims a PENDING row in a
 * short transaction, does every external call (installation token, HEAD SHA
 * lookups, the rag-service call) OUTSIDE any transaction, then saves the result
 * in a second short transaction. Same "선점 → 트랜잭션 밖 외부 호출 → 저장" shape as
 * LearningPlanService.generate(), except the external work runs on
 * GithubAsyncConfig's own executor instead of inline in the request -- see
 * docs/github-diagnosis.md section 5 for why this one has to be truly async. */
@Service @RequiredArgsConstructor @Slf4j
public class GithubAnalysisService {
    static final String PENDING = "PENDING";
    static final String RUNNING = "RUNNING";
    static final String COMPLETED = "COMPLETED";
    static final String FAILED = "FAILED";
    static final String CANCELLED = "CANCELLED";
    private static final long STALE_SECONDS = 180;

    private final GithubConnectionService connectionService;
    private final GithubAnalysisRunner runner;
    private final GithubCatalogLinker catalogLinker;
    private final GithubAnalysisRepository analyses;
    private final GithubUserLock userLock;
    private final TransactionTemplate tx;
    private final ObjectMapper mapper;

    private record Claim(GithubAnalysisEntity row, boolean start) {}

    /** Returns immediately with the claimed/existing row; the actual run (if any)
     * continues on GithubAsyncConfig's executor after this returns. */
    public AnalysisView requestAnalysis(Long userKey) {
        var connection = connectionService.requireInstalled(userKey);
        var selected = connectionService.selectedRepositories(connection.getId());
        if (selected.isEmpty())
            throw new CodeReviewException(HttpStatus.BAD_REQUEST, "분석할 저장소를 먼저 선택해주세요.");

        var claim = tx.execute(status -> {
            userLock.lock(userKey);
            var previous = analyses.findFirstByUserKeyOrderByIdDesc(userKey);
            if (previous.isPresent()) {
                var row = previous.get();
                boolean active = (row.getStatus().equals(PENDING) || row.getStatus().equals(RUNNING))
                        && row.getRequestedAt().isAfter(LocalDateTime.now().minusSeconds(STALE_SECONDS));
                if (active) return new Claim(row, false); // dedupe: already running, don't start a second one
            }
            var row = new GithubAnalysisEntity();
            row.setUserKey(userKey);
            row.setConnectionId(connection.getId());
            row.setStatus(PENDING);
            row.setRequestedAt(LocalDateTime.now());
            row.setReposJson(json(selected.stream()
                    .map(r -> new AllowedRepoRef(r.getOwner(), r.getName(), null)).toList()));
            return new Claim(analyses.saveAndFlush(row), true);
        });

        if (claim.start()) runner.run(claim.row().getId(), connection.getId(), userKey);
        return toView(claim.row());
    }

    public AnalysisView latest(Long userKey) {
        return analyses.findFirstByUserKeyOrderByIdDesc(userKey).map(this::toView)
                .orElse(new AnalysisView(null, "NONE", List.of(), null, null, false,
                        List.of(), List.of(), List.of(), null, null, null, "아직 분석 요청이 없습니다."));
    }

    public AnalysisView get(Long userKey, Long id) {
        var row = analyses.findById(id)
                .filter(r -> r.getUserKey().equals(userKey))
                .orElseThrow(() -> new CodeReviewException(HttpStatus.NOT_FOUND, "분석 결과를 찾을 수 없습니다."));
        return toView(row);
    }

    public AnalysisView cancel(Long userKey, Long id) {
        return tx.execute(status -> {
            userLock.lock(userKey);
            var row = analyses.findById(id)
                    .filter(r -> r.getUserKey().equals(userKey))
                    .orElseThrow(() -> new CodeReviewException(HttpStatus.NOT_FOUND, "분석 결과를 찾을 수 없습니다."));
            if (row.getStatus().equals(PENDING)) {
                row.setStatus(CANCELLED);
                row.setCompletedAt(LocalDateTime.now());
            } else if (row.getStatus().equals(RUNNING)) {
                row.setCancelRequested(true); // best-effort -- realized at the next checkpoint in runAsync
            }
            return toView(analyses.save(row));
        });
    }

    private AnalysisView toView(GithubAnalysisEntity row) {
        List<AllowedRepoRef> repos = readList(row.getReposJson(), AllowedRepoRef[].class);
        boolean generating = row.getStatus().equals(PENDING) || row.getStatus().equals(RUNNING);
        if (!row.getStatus().equals(COMPLETED) || row.getResultJson() == null) {
            return new AnalysisView(row.getId(), row.getStatus(), repos, row.getRequestedAt(), row.getCompletedAt(),
                    generating, List.of(), List.of(), List.of(), null, null, row.getErrorMessage(), notice(row.getStatus()));
        }
        DiagnoseResponse result = read(row.getResultJson(), DiagnoseResponse.class);
        List<RecommendedTopic> topics = result.recommendedTopics().stream()
                .map(t -> catalogLinker.link(t.concept(), t.reason())).toList();
        return new AnalysisView(row.getId(), row.getStatus(), repos, row.getRequestedAt(), row.getCompletedAt(),
                generating, result.confirmed(), result.gaps(), topics, result.scopeNote(), result.actualScope(),
                null, notice(row.getStatus()));
    }

    private String notice(String status) {
        return switch (status) {
            case "PENDING" -> "분석을 준비하고 있습니다.";
            case "RUNNING" -> "저장소를 조사하는 중입니다. 완료까지 몇 분 걸릴 수 있습니다.";
            case "FAILED" -> "분석에 실패했습니다. 다시 시도해주세요.";
            case "CANCELLED" -> "분석이 취소되었습니다.";
            case "COMPLETED" -> "분석이 완료되었습니다.";
            default -> null;
        };
    }

    private String json(Object value) {
        try { return mapper.writeValueAsString(value); } catch (Exception e) { throw new IllegalStateException(e); }
    }
    private <T> List<T> readList(String json, Class<T[]> type) {
        try { return List.of(mapper.readValue(json, type)); } catch (Exception e) { throw new IllegalStateException(e); }
    }
    private <T> T read(String json, Class<T> type) {
        try { return mapper.readValue(json, type); } catch (Exception e) { throw new IllegalStateException(e); }
    }
}
