package com.kh.totalproject.github;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.totalproject.constant.codereview.CodeReviewStatus;
import com.kh.totalproject.dto.request.RagSolutionSummaryRequest;
import com.kh.totalproject.dto.response.CodeReviewContent;
import com.kh.totalproject.dto.response.SolutionSummaryContent;
import com.kh.totalproject.entity.CodeChallengeJudgment;
import com.kh.totalproject.repository.CodeChallengeJudgmentRepository;
import com.kh.totalproject.repository.CodeReviewRepository;
import com.kh.totalproject.service.CodeReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.nio.file.Path;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/** The actual auto-commit run -- its own bean for the same @Async self-invocation
 * reason as GithubAnalysisRunner (feature ①). AutoCommitJobScheduler is the only
 * caller. One run = one job attempt: re-validate live -> summarize (best-effort) ->
 * upload via MCP -> save outcome. See docs/github-auto-commit.md sections 5-7. */
@Component @RequiredArgsConstructor @Slf4j
public class AutoCommitJobRunner {
    static final int MAX_TRANSIENT_ATTEMPTS = 3;
    private static final long[] BACKOFF_SECONDS = {30, 120, 600};
    private static final Duration MCP_START_TIMEOUT = Duration.ofSeconds(20);
    private static final Duration MCP_CALL_TIMEOUT = Duration.ofSeconds(30);

    private final AutoCommitJobRepository jobs;
    private final AutoSaveSettingRepository settings;
    private final GithubConnectionRepository connections;
    private final GithubAppClient appClient;
    private final GithubAppProperties appProperties;
    private final GithubMcpClient mcpClient;
    private final GithubMcpProperties mcpProperties;
    private final SolutionSummaryClient summaryClient;
    private final CodeChallengeJudgmentRepository judgmentRepository;
    private final CodeReviewRepository codeReviewRepository;
    private final TransactionTemplate tx;
    private final ObjectMapper mapper;

    private record Context(AutoCommitJobEntity job, GithubConnectionEntity connection,
                           String language, String challengeTitle, String challengeDescription,
                           String challengeCondition, String challengeCategory, String challengeDifficulty,
                           Long challengeIdForUrl, String code, Integer maxElapsedTimeMs, Float maxMemoryUsageMb,
                           RagSolutionSummaryRequest.ExistingReview existingReview) {}

    @Async(GithubAsyncConfig.EXECUTOR_NAME)
    public void run(Long jobId) {
        try {
            process(jobId);
        } catch (Exception e) {
            log.warn("Auto-commit job {} hit an unexpected error: {}", jobId, e.getClass().getSimpleName());
            saveTerminalFailure(jobId, "UNKNOWN", "작업 처리 중 예상치 못한 오류가 발생했습니다.");
        }
    }

    private void process(Long jobId) {
        Context ctx = claimAndLoad(jobId);
        if (ctx == null) return; // already SKIPPED/handled inside claimAndLoad

        if (!mcpProperties.configured()) {
            saveTerminalFailure(jobId, "PERMISSION", "GitHub 자동 저장 기능이 아직 설정되지 않았습니다.");
            return;
        }

        // Live permission re-check -- never trust the cached flag for the actual write (section 1).
        String installationToken;
        boolean hasWrite;
        try {
            var info = appClient.getInstallation(ctx.connection().getInstallationId());
            hasWrite = info.hasContentsWrite();
            updateCachedWritePermission(ctx.connection().getUserKey(), hasWrite);
            if (!hasWrite) {
                saveTerminalFailure(jobId, "PERMISSION", "저장소 쓰기 권한이 없습니다. 권한을 다시 연결해주세요.");
                return;
            }
            installationToken = appClient.createInstallationToken(ctx.connection().getInstallationId());
        } catch (Exception e) {
            saveWithClassification(jobId, e, "설치 토큰을 가져오지 못했습니다.");
            return;
        }

        String solutionFile = AutoCommitPaths.solutionFileName(languageEnum(ctx.language()));
        String solutionPath = ctx.job().getPath() + "/" + solutionFile;
        String readmePath = ctx.job().getPath() + "/README.md";
        String commitMessage = "Auto-save: " + ctx.challengeTitle() + " (#" + ctx.job().getChallengeId() + ")";

        // Idempotent retry: a prior TRANSIENT failure's actual outcome on GitHub is
        // unknown (the timeout could have happened after the commit landed) -- check
        // before writing again rather than risking a duplicate commit (section 6).
        if (ctx.job().getAttemptCount() > 1) {
            try {
                Optional<GithubAppClient.RecentCommit> existing = appClient.findMatchingRecentCommit(
                        installationToken, ctx.job().getOwner(), ctx.job().getName(), ctx.job().getBranch(), solutionPath, commitMessage);
                if (existing.isPresent()) {
                    saveSuccess(jobId, existing.get().sha(), commitUrl(ctx.job(), existing.get().sha()), null, null);
                    return;
                }
            } catch (Exception e) {
                log.warn("Could not check for a prior commit on retry for job {}: {}", jobId, e.getClass().getSimpleName());
                // fall through and attempt the write anyway -- worst case is caught by expected_base_sha/
                // expected_solution_sha below, which still won't double-write if the branch already moved.
            }
        }

        String baseSha;
        try {
            baseSha = appClient.getDefaultBranchHeadSha(installationToken, ctx.job().getOwner(), ctx.job().getName(), ctx.job().getBranch());
        } catch (Exception e) {
            saveWithClassification(jobId, e, "브랜치 정보를 가져오지 못했습니다.");
            return;
        }

        String expectedSolutionSha = jobs.findFirstByOwnerAndNameAndPathAndStatusOrderByIdDesc(
                        ctx.job().getOwner(), ctx.job().getName(), ctx.job().getPath(), "COMPLETED")
                .map(AutoCommitJobEntity::getSolutionBlobSha).orElse(null);

        SolutionSummaryContent summary = generateSummaryOrDefault(ctx);
        String readmeContent = buildReadme(ctx, summary, solutionFile);

        var scopeEnv = Map.of(
                "GITHUB_INSTALLATION_TOKEN", installationToken,
                "GITHUB_WRITE_OWNER", ctx.job().getOwner(),
                "GITHUB_WRITE_REPO", ctx.job().getName(),
                "GITHUB_WRITE_BRANCH", ctx.job().getBranch(),
                "GITHUB_WRITE_BASE_PATH", AutoCommitPaths.normalizeBasePath(settingBasePath(ctx.connection().getUserKey()))
        );
        var arguments = new java.util.LinkedHashMap<String, Object>();
        arguments.put("owner", ctx.job().getOwner());
        arguments.put("repo", ctx.job().getName());
        arguments.put("branch", ctx.job().getBranch());
        arguments.put("solution_path", solutionPath);
        arguments.put("solution_content", ctx.code());
        arguments.put("readme_path", readmePath);
        arguments.put("readme_content", readmeContent);
        arguments.put("commit_message", commitMessage);
        arguments.put("author_name", ctx.connection().getGithubLogin());
        arguments.put("author_email", noreplyEmail(ctx.connection()));
        arguments.put("expected_base_sha", baseSha);
        if (expectedSolutionSha != null) arguments.put("expected_solution_sha", expectedSolutionSha);

        try (var session = mcpClient.start(mcpProperties.pythonExecutable(), Path.of(mcpProperties.serverScript()), scopeEnv, MCP_START_TIMEOUT)) {
            String resultJson = session.callTool("upload_solution", arguments, MCP_CALL_TIMEOUT);
            var result = mapper.readTree(resultJson);
            var solutionShaNode = result.path("solutionSha");
            saveSuccess(jobId, result.path("commitSha").asText(), result.path("commitUrl").asText(),
                    solutionShaNode.isTextual() ? solutionShaNode.asText() : null, serialize(summary));
        } catch (Exception e) {
            saveWithClassification(jobId, e, "GitHub에 커밋을 기록하지 못했습니다.");
        }
    }

    // ---- claim + live re-validation --------------------------------------------

    private Context claimAndLoad(Long jobId) {
        return tx.execute(status -> {
            var job = jobs.findById(jobId).orElse(null);
            if (job == null || !(job.getStatus().equals("PENDING") || job.getStatus().equals("FAILED"))) {
                return null; // already completed/skipped/picked up by a concurrent run
            }
            var connection = connections.findByUserKey(job.getUserKey()).orElse(null);
            var setting = settings.findByUserKey(job.getUserKey()).orElse(null);
            if (connection == null || !connection.isInstalled() || setting == null || !setting.isEnabled()) {
                job.setStatus("SKIPPED");
                job.setErrorCategory(null);
                job.setErrorMessage("자동 저장이 꺼져 있거나 연결이 해제되어 건너뜁니다.");
                job.setUpdatedAt(LocalDateTime.now());
                jobs.save(job);
                return null;
            }
            CodeChallengeJudgment judgment = judgmentRepository.findById(job.getJudgmentId()).orElse(null);
            if (judgment == null) {
                job.setStatus("FAILED");
                job.setErrorCategory("UNKNOWN");
                job.setErrorMessage("제출 기록을 찾을 수 없습니다.");
                job.setUpdatedAt(LocalDateTime.now());
                jobs.save(job);
                return null;
            }
            String code;
            try {
                code = CodeReviewService.decodeCode(judgment.getCode());
            } catch (Exception e) {
                job.setStatus("FAILED");
                job.setErrorCategory("UNKNOWN");
                job.setErrorMessage("제출 코드를 읽을 수 없습니다.");
                job.setUpdatedAt(LocalDateTime.now());
                jobs.save(job);
                return null;
            }

            var existingReview = codeReviewRepository
                    .findByJudgment_JudgmentIdAndReviewVersion(job.getJudgmentId(), CodeReviewService.REVIEW_VERSION)
                    .filter(r -> r.getStatus() == CodeReviewStatus.COMPLETED && r.getContentJson() != null)
                    .map(this::toExistingReview).orElse(null);

            job.setStatus("RUNNING");
            job.setAttemptCount(job.getAttemptCount() + 1);
            job.setUpdatedAt(LocalDateTime.now());
            jobs.save(job);

            var challenge = judgment.getCodeChallenge();
            return new Context(job, connection, judgment.getCodeLanguage().name(), challenge.getTitle(),
                    challenge.getDescription(), challenge.getCond(), challenge.getCategory(),
                    challenge.getDifficulty() == null ? null : challenge.getDifficulty().name().toLowerCase(Locale.ROOT),
                    challenge.getChallengeId(), code, judgment.getMaxElapsedTimeMs(), judgment.getMaxMemoryUsageMb(),
                    existingReview);
        });
    }

    private RagSolutionSummaryRequest.ExistingReview toExistingReview(com.kh.totalproject.entity.CodeReview review) {
        try {
            var content = mapper.readValue(review.getContentJson(), CodeReviewContent.class);
            return new RagSolutionSummaryRequest.ExistingReview(content.summary(),
                    content.complexity() == null ? null : content.complexity().time(),
                    content.complexity() == null ? null : content.complexity().space(),
                    content.complexity() == null || content.complexity().assumptions() == null
                            ? List.of() : content.complexity().assumptions());
        } catch (Exception e) {
            return null; // treat an unreadable stored review the same as "no review" -- never block the commit on it
        }
    }

    // ---- AI summary (best-effort, at most one try per job attempt) ----------------

    private SolutionSummaryContent generateSummaryOrDefault(Context ctx) {
        try {
            var request = new RagSolutionSummaryRequest(
                    new RagSolutionSummaryRequest.Submission(ctx.job().getJudgmentId(), ctx.language(), ctx.code(),
                            ctx.maxElapsedTimeMs(), ctx.maxMemoryUsageMb()),
                    new RagSolutionSummaryRequest.Challenge(ctx.challengeIdForUrl(), ctx.challengeTitle(),
                            ctx.challengeDescription(), ctx.challengeCondition(), ctx.challengeCategory(), ctx.challengeDifficulty()),
                    ctx.existingReview());
            return summaryClient.generate(request);
        } catch (Exception e) {
            log.warn("Summary generation failed for job {}, using the default description: {}",
                    ctx.job().getId(), e.getClass().getSimpleName());
            return new SolutionSummaryContent("AI 요약을 생성하지 못했습니다. 코드는 저장되었습니다.", "-", "-", List.of(),
                    "AI 요약을 생성하지 못했습니다. 코드는 저장되었습니다.",
                    new SolutionSummaryContent.ObservedMetrics(ctx.maxElapsedTimeMs(), ctx.maxMemoryUsageMb()));
        }
    }

    private String buildReadme(Context ctx, SolutionSummaryContent summary, String solutionFile) {
        String domain = appProperties.domainUrl();
        String url = (domain == null ? "" : domain) + "/codingtest/" + ctx.challengeDifficulty() + "/" + ctx.challengeIdForUrl();
        StringBuilder sb = new StringBuilder();
        sb.append("# ").append(ctx.challengeTitle()).append("\n\n");
        sb.append("- 문제: [educoding에서 보기](").append(url).append(")\n");
        sb.append("- 언어: ").append(ctx.language()).append(" (`").append(solutionFile).append("`)\n");
        sb.append("- 접근 방법: ").append(summary.approach()).append("\n");
        sb.append("- 시간 복잡도: ").append(summary.timeComplexity()).append("\n");
        sb.append("- 공간 복잡도: ").append(summary.spaceComplexity()).append("\n");
        if (summary.assumptions() != null && !summary.assumptions().isEmpty()) {
            sb.append("- 가정: ").append(String.join(", ", summary.assumptions())).append("\n");
        }
        sb.append("- 한 줄 요약: ").append(summary.oneLineSummary()).append("\n");
        var metrics = summary.observedMetrics();
        if (metrics != null && (metrics.maxElapsedTimeMs() != null || metrics.maxMemoryUsageMb() != null)) {
            sb.append("- 채점 결과: ")
              .append(metrics.maxElapsedTimeMs() == null ? "-" : metrics.maxElapsedTimeMs() + "ms").append(" / ")
              .append(metrics.maxMemoryUsageMb() == null ? "-" : metrics.maxMemoryUsageMb() + "MB").append("\n");
        }
        sb.append("\n> 이 요약은 AI가 생성했습니다. educoding에서 자동으로 기록되었습니다 "
                + "(GitHub 기여 그래프에 표시될 수 있으나 보장되지는 않습니다).\n");
        return sb.toString();
    }

    // ---- result persistence --------------------------------------------------------

    private void saveSuccess(Long jobId, String commitSha, String commitUrl, String solutionSha, String summaryJson) {
        tx.executeWithoutResult(status -> {
            var job = jobs.findById(jobId).orElseThrow();
            job.setStatus("COMPLETED");
            job.setCommitSha(commitSha);
            job.setCommitUrl(commitUrl);
            if (solutionSha != null) job.setSolutionBlobSha(solutionSha);
            if (summaryJson != null) { job.setSummaryJson(summaryJson); job.setSummaryVersion(1); }
            job.setErrorCategory(null);
            job.setErrorMessage(null);
            job.setUpdatedAt(LocalDateTime.now());
            jobs.save(job);
        });
    }

    private void saveWithClassification(Long jobId, Exception e, String fallbackMessage) {
        String category = classify(e);
        String message = e.getMessage() != null && !e.getMessage().isBlank() ? stripTags(e.getMessage()) : fallbackMessage;
        tx.executeWithoutResult(status -> {
            var job = jobs.findById(jobId).orElseThrow();
            job.setStatus("FAILED");
            job.setErrorCategory(category);
            job.setErrorMessage(message.length() > 500 ? message.substring(0, 500) : message);
            if (category.equals("TRANSIENT") && job.getAttemptCount() < MAX_TRANSIENT_ATTEMPTS) {
                long delay = BACKOFF_SECONDS[Math.min(job.getAttemptCount() - 1, BACKOFF_SECONDS.length - 1)];
                job.setNextAttemptAt(LocalDateTime.now().plusSeconds(delay));
            } else {
                job.setNextAttemptAt(null); // exhausted auto-retries, or not an auto-retryable category -- needs a manual retry
            }
            job.setUpdatedAt(LocalDateTime.now());
            jobs.save(job);
        });
    }

    private void saveTerminalFailure(Long jobId, String category, String message) {
        tx.executeWithoutResult(status -> {
            var job = jobs.findById(jobId).orElse(null);
            if (job == null) return;
            job.setStatus("FAILED");
            job.setErrorCategory(category);
            job.setErrorMessage(message);
            job.setNextAttemptAt(null);
            job.setUpdatedAt(LocalDateTime.now());
            jobs.save(job);
        });
    }

    private void updateCachedWritePermission(Long userKey, boolean granted) {
        tx.executeWithoutResult(status -> connections.findByUserKey(userKey).ifPresent(c -> {
            c.setWritePermissionGranted(granted);
            c.setWritePermissionCheckedAt(LocalDateTime.now());
            connections.save(c);
        }));
    }

    private String settingBasePath(Long userKey) {
        return settings.findByUserKey(userKey).map(AutoSaveSettingEntity::getBasePath).orElse("");
    }

    private String classify(Exception e) {
        String msg = e.getMessage();
        if (msg != null) {
            if (msg.contains("[CONFLICT]")) return "CONFLICT";
            if (msg.contains("[PERMISSION]")) return "PERMISSION";
            if (msg.contains("[TRANSIENT]")) return "TRANSIENT";
        }
        if (e instanceof java.io.IOException) return "TRANSIENT"; // MCP process spawn/timeout -- likely infra, not logic
        return "UNKNOWN";
    }

    private String stripTags(String message) {
        return message.replace("[CONFLICT]", "").replace("[PERMISSION]", "").replace("[TRANSIENT]", "").trim();
    }

    private String serialize(SolutionSummaryContent content) {
        try { return mapper.writeValueAsString(content); } catch (Exception e) { return null; }
    }

    private String commitUrl(AutoCommitJobEntity job, String sha) {
        return "https://github.com/" + job.getOwner() + "/" + job.getName() + "/commit/" + sha;
    }

    private String noreplyEmail(GithubConnectionEntity connection) {
        return connection.getGithubUserId() + "+" + connection.getGithubLogin() + "@users.noreply.github.com";
    }

    private com.kh.totalproject.constant.codechallenge.enums.CodeChallengeLanguage languageEnum(String name) {
        return com.kh.totalproject.constant.codechallenge.enums.CodeChallengeLanguage.valueOf(name);
    }
}
