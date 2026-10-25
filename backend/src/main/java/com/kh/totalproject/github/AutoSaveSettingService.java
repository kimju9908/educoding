package com.kh.totalproject.github;

import com.kh.totalproject.exception.CodeReviewException;
import com.kh.totalproject.repository.CodeChallengeJudgmentRepository;
import com.kh.totalproject.service.CodeReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.List;

import static com.kh.totalproject.github.GithubModels.*;

/** Settings CRUD/enable-disable, preview, and job history/retry for
 * docs/github-auto-commit.md section 1/8. Connecting an account or approving
 * write permission never flips enabled -- only {@link #enable} does, and only
 * after the caller has already fetched a {@link #preview}. */
@Service @RequiredArgsConstructor
public class AutoSaveSettingService {
    private final GithubConnectionRepository connections;
    private final GithubRepositoryRepository repositories;
    private final AutoSaveSettingRepository settings;
    private final AutoCommitJobRepository jobs;
    private final CodeChallengeJudgmentRepository judgmentRepository;
    private final GithubUserLock userLock;
    private final TransactionTemplate tx;

    public AutoSaveSettingView view(Long userKey) {
        var connection = connections.findByUserKey(userKey).filter(GithubConnectionEntity::isInstalled).orElse(null);
        if (connection == null) return new AutoSaveSettingView(false, false, null, null, null, null, "", false, null);
        var setting = settings.findByUserKey(userKey).orElse(null);
        return new AutoSaveSettingView(setting != null, setting != null && setting.isEnabled(),
                setting == null ? null : setting.getRepositoryId(), setting == null ? null : setting.getOwner(),
                setting == null ? null : setting.getName(), setting == null ? null : setting.getBranch(),
                setting == null ? "" : setting.getBasePath(),
                connection.isWritePermissionGranted(), connection.installationManageUrl());
    }

    public AutoSaveSettingView save(Long userKey, AutoSaveSettingRequest request) {
        if (request.branch() == null || request.branch().isBlank()) {
            throw new CodeReviewException(HttpStatus.BAD_REQUEST, "브랜치를 입력해주세요.");
        }
        String normalizedBasePath = AutoCommitPaths.normalizeBasePath(request.basePath());
        var connection = requireInstalled(userKey);
        var repo = repositories.findById(request.repositoryId())
                .filter(r -> r.getConnectionId().equals(connection.getId()))
                .orElseThrow(() -> new CodeReviewException(HttpStatus.BAD_REQUEST, "설치된 저장소 목록 밖의 저장소입니다."));
        return tx.execute(status -> {
            userLock.lock(userKey);
            var setting = settings.findByUserKey(userKey).orElseGet(AutoSaveSettingEntity::new);
            boolean isNew = setting.getCreatedAt() == null;
            setting.setUserKey(userKey);
            setting.setConnectionId(connection.getId());
            setting.setRepositoryId(repo.getId());
            setting.setOwner(repo.getOwner());
            setting.setName(repo.getName());
            setting.setBranch(request.branch());
            setting.setBasePath(normalizedBasePath);
            var now = LocalDateTime.now();
            if (isNew) setting.setCreatedAt(now);
            setting.setUpdatedAt(now);
            settings.save(setting);
            return view(userKey);
        });
    }

    public AutoSaveSettingView enable(Long userKey) {
        settings.findByUserKey(userKey)
                .orElseThrow(() -> new CodeReviewException(HttpStatus.BAD_REQUEST, "먼저 자동 저장 설정을 저장해주세요."));
        requireInstalled(userKey);
        return tx.execute(status -> {
            userLock.lock(userKey);
            var setting = settings.findByUserKey(userKey).orElseThrow();
            setting.setEnabled(true);
            setting.setEnabledAt(LocalDateTime.now());
            setting.setUpdatedAt(LocalDateTime.now());
            settings.save(setting);
            return view(userKey);
        });
    }

    public AutoSaveSettingView disable(Long userKey) {
        return tx.execute(status -> {
            userLock.lock(userKey);
            settings.findByUserKey(userKey).ifPresent(setting -> {
                setting.setEnabled(false);
                setting.setUpdatedAt(LocalDateTime.now());
                settings.save(setting);
            });
            return view(userKey);
        });
    }

    /** Shows exactly what WOULD be saved, using the user's own most recent passed
     * submission -- the real solution content, and a README skeleton (the AI-filled
     * parts are only known at actual save time, so they're placeholders here). */
    public AutoCommitPreview preview(Long userKey) {
        var setting = settings.findByUserKey(userKey)
                .orElseThrow(() -> new CodeReviewException(HttpStatus.BAD_REQUEST, "먼저 자동 저장 설정을 저장해주세요."));
        var judgment = judgmentRepository.findFirstByUser_UserKeyAndPassedTrueOrderByJudgmentIdDesc(userKey)
                .orElseThrow(() -> new CodeReviewException(HttpStatus.NOT_FOUND, "미리보기할 정답 제출이 아직 없습니다."));
        String code = CodeReviewService.decodeCode(judgment.getCode());
        var challenge = judgment.getCodeChallenge();
        String path = AutoCommitPaths.challengeFolder(setting.getBasePath(), judgment.getCodeLanguage(),
                challenge.getChallengeId(), challenge.getTitle());
        String solutionFile = AutoCommitPaths.solutionFileName(judgment.getCodeLanguage());
        String readmeSkeleton = "# " + challenge.getTitle() + "\n\n"
                + "- 문제: educoding에서 보기\n"
                + "- 접근 방법: (저장 시 AI가 생성)\n"
                + "- 시간/공간 복잡도: (저장 시 AI가 생성)\n"
                + "- 한 줄 요약: (저장 시 AI가 생성)\n\n"
                + "> 이 요약은 AI가 생성합니다.\n";
        return new AutoCommitPreview(path, solutionFile, code, readmeSkeleton);
    }

    public List<AutoCommitJobView> recentJobs(Long userKey) {
        return jobs.findByUserKeyOrderByIdDesc(userKey, PageRequest.of(0, 20)).stream().map(this::toView).toList();
    }

    public AutoCommitJobView retry(Long userKey, Long jobId) {
        return tx.execute(status -> {
            userLock.lock(userKey);
            var job = jobs.findById(jobId).filter(j -> j.getUserKey().equals(userKey))
                    .orElseThrow(() -> new CodeReviewException(HttpStatus.NOT_FOUND, "작업을 찾을 수 없습니다."));
            if (!job.getStatus().equals("FAILED")) {
                throw new CodeReviewException(HttpStatus.BAD_REQUEST, "실패한 작업만 다시 시도할 수 있습니다.");
            }
            job.setStatus("PENDING");
            job.setErrorCategory(null);
            job.setErrorMessage(null);
            job.setNextAttemptAt(null);
            job.setUpdatedAt(LocalDateTime.now());
            jobs.save(job);
            return toView(job);
        });
    }

    private GithubConnectionEntity requireInstalled(Long userKey) {
        return connections.findByUserKey(userKey).filter(GithubConnectionEntity::isInstalled)
                .orElseThrow(() -> new CodeReviewException(HttpStatus.BAD_REQUEST, "먼저 GitHub 저장소 접근 권한을 연결해주세요."));
    }

    private AutoCommitJobView toView(AutoCommitJobEntity job) {
        return new AutoCommitJobView(job.getId(), job.getJudgmentId(), job.getChallengeId(), job.getStatus(),
                job.getErrorCategory(), job.getErrorMessage(), job.getOwner(), job.getName(), job.getBranch(),
                job.getPath(), job.getCommitSha(), job.getCommitUrl(), job.getCreatedAt(), job.getUpdatedAt(),
                job.getAttemptCount());
    }
}
