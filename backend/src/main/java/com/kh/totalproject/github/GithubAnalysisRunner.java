package com.kh.totalproject.github;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static com.kh.totalproject.github.GithubAnalysisService.*;
import static com.kh.totalproject.github.GithubModels.*;

/** The actual background run, split into its own Spring bean on purpose: `@Async`
 * only takes effect through the proxy Spring wraps around a bean, and a method
 * calling another method ON ITSELF (same instance) never goes through that proxy
 * -- it would just run synchronously, silently defeating the whole point. See
 * GithubAnalysisService.requestAnalysis(), which calls this through its own
 * injected GithubAnalysisRunner instead. */
@Component @RequiredArgsConstructor @Slf4j
public class GithubAnalysisRunner {
    private final GithubConnectionService connectionService;
    private final GithubAppClient appClient;
    private final GithubAnalysisClient analysisClient;
    private final GithubCatalogLinker catalogLinker;
    private final GithubAnalysisRepository analyses;
    private final TransactionTemplate tx;
    private final ObjectMapper mapper;

    @Async(GithubAsyncConfig.EXECUTOR_NAME)
    public void run(Long analysisId, Long connectionId, Long userKey) {
        try {
            var connection = connectionService.requireInstalled(userKey);
            var selected = connectionService.selectedRepositories(connectionId);
            String installationToken = appClient.createInstallationToken(connection.getInstallationId());
            var reposWithSha = new ArrayList<AllowedRepoRef>();
            for (var repo : selected) {
                String headSha = appClient.getDefaultBranchHeadSha(
                        installationToken, repo.getOwner(), repo.getName(), repo.getDefaultBranch());
                reposWithSha.add(new AllowedRepoRef(repo.getOwner(), repo.getName(), headSha));
            }

            if (checkpointCancelled(analysisId)) return;
            tx.executeWithoutResult(status -> {
                var row = analyses.findById(analysisId).orElseThrow();
                row.setStatus(RUNNING);
                row.setStartedAt(LocalDateTime.now());
                row.setReposJson(json(reposWithSha));
                analyses.save(row);
            });

            Set<String> allowedConcepts = catalogLinker.allowedConcepts();
            var request = new DiagnoseRequest(reposWithSha, connection.getGithubLogin(), List.copyOf(allowedConcepts));
            DiagnoseResponse response = analysisClient.diagnose(request, installationToken);

            // Defense in depth: re-check the model's recommendedTopics against the SAME
            // allowed-concept list we sent, even though rag/service's github_graph.py
            // already validated it once (same double-validation principle as
            // LearningEngine.validateSelection re-checking learning_graph.py's output).
            var filteredTopics = response.recommendedTopics().stream()
                    .filter(t -> allowedConcepts.contains(t.concept())).toList();
            var safeResponse = new DiagnoseResponse(response.confirmed(), response.gaps(), filteredTopics,
                    response.scopeNote(), response.actualScope());

            if (checkpointCancelled(analysisId)) return;
            tx.executeWithoutResult(status -> {
                var row = analyses.findById(analysisId).orElseThrow();
                row.setStatus(COMPLETED);
                row.setCompletedAt(LocalDateTime.now());
                row.setResultJson(json(safeResponse));
                analyses.save(row);
            });
        } catch (Exception e) {
            // Never log headers, tokens, raw model responses or repository content.
            log.warn("GitHub analysis {} failed: {}", analysisId, e.getClass().getSimpleName());
            tx.executeWithoutResult(status -> {
                var row = analyses.findById(analysisId).orElseThrow();
                if (!row.getStatus().equals(CANCELLED)) {
                    row.setStatus(row.isCancelRequested() ? CANCELLED : FAILED);
                    row.setCompletedAt(LocalDateTime.now());
                    row.setErrorMessage("분석 중 오류가 발생했습니다 (" + e.getClass().getSimpleName() + ")");
                    analyses.save(row);
                }
            });
        }
    }

    /** Best-effort cancellation: there is no way to interrupt a single in-flight
     * rag-service call, so cancellation only takes effect at a checkpoint between
     * steps (see docs/github-diagnosis.md section 5). */
    private boolean checkpointCancelled(Long analysisId) {
        return tx.execute(status -> {
            var row = analyses.findById(analysisId).orElseThrow();
            if (row.isCancelRequested() && !row.getStatus().equals(CANCELLED)) {
                row.setStatus(CANCELLED);
                row.setCompletedAt(LocalDateTime.now());
                analyses.save(row);
                return true;
            }
            return row.getStatus().equals(CANCELLED);
        });
    }

    private String json(Object value) {
        try { return mapper.writeValueAsString(value); } catch (Exception e) { throw new IllegalStateException(e); }
    }
}
