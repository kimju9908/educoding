package com.kh.totalproject.github;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeDifficulty;
import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeLanguage;
import com.kh.totalproject.dto.response.SolutionSummaryContent;
import com.kh.totalproject.entity.CodeChallenge;
import com.kh.totalproject.entity.CodeChallengeJudgment;
import com.kh.totalproject.repository.CodeChallengeJudgmentRepository;
import com.kh.totalproject.repository.CodeReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** The actual run (one job attempt) -- called directly, not through @Async, so
 * these are plain synchronous tests. Covers live re-validation, the write-
 * permission re-check, best-effort AI fallback, idempotent-retry commit lookup,
 * and failure classification -- see docs/github-auto-commit.md sections 5-7. */
class AutoCommitJobRunnerTest {
    AutoCommitJobRepository jobs = mock(AutoCommitJobRepository.class);
    AutoSaveSettingRepository settings = mock(AutoSaveSettingRepository.class);
    GithubConnectionRepository connections = mock(GithubConnectionRepository.class);
    GithubAppClient appClient = mock(GithubAppClient.class);
    GithubAppProperties appProperties = mock(GithubAppProperties.class);
    GithubMcpClient mcpClient = mock(GithubMcpClient.class);
    GithubMcpProperties mcpProperties = mock(GithubMcpProperties.class);
    SolutionSummaryClient summaryClient = mock(SolutionSummaryClient.class);
    CodeChallengeJudgmentRepository judgmentRepository = mock(CodeChallengeJudgmentRepository.class);
    CodeReviewRepository codeReviewRepository = mock(CodeReviewRepository.class);
    TransactionTemplate tx = mock(TransactionTemplate.class);
    ObjectMapper mapper = new ObjectMapper();
    AutoCommitJobRunner runner;
    AutoCommitJobEntity job;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setup() {
        runner = new AutoCommitJobRunner(jobs, settings, connections, appClient, appProperties, mcpClient,
                mcpProperties, summaryClient, judgmentRepository, codeReviewRepository, tx, mapper);
        when(tx.execute(any())).thenAnswer(i -> ((TransactionCallback<?>) i.getArgument(0)).doInTransaction(null));
        doAnswer(i -> { ((Consumer<Object>) i.getArgument(0)).accept(null); return null; })
                .when(tx).executeWithoutResult(any());

        job = new AutoCommitJobEntity();
        job.setId(1L); job.setUserKey(1L); job.setJudgmentId(100L); job.setChallengeId(7L);
        job.setStatus("PENDING"); job.setOwner("octocat"); job.setName("hello-world"); job.setBranch("main");
        job.setPath("python/0007-foo"); job.setAttemptCount(0);
        when(jobs.findById(1L)).thenAnswer(i -> Optional.of(job));
        when(jobs.findFirstByOwnerAndNameAndPathAndStatusOrderByIdDesc(any(), any(), any(), any())).thenReturn(Optional.empty());

        var connection = new GithubConnectionEntity();
        connection.setUserKey(1L); connection.setInstallationId(555L); connection.setGithubLogin("octocat"); connection.setGithubUserId(42L);
        when(connections.findByUserKey(1L)).thenReturn(Optional.of(connection));

        var setting = new AutoSaveSettingEntity();
        setting.setUserKey(1L); setting.setEnabled(true); setting.setBasePath("");
        when(settings.findByUserKey(1L)).thenReturn(Optional.of(setting));

        var challenge = new CodeChallenge();
        challenge.setChallengeId(7L); challenge.setTitle("foo"); challenge.setDescription("desc");
        challenge.setCond("cond"); challenge.setDifficulty(CodeChallengeDifficulty.PRACTICE);
        String encodedCode = Base64.getEncoder().encodeToString("print(1)".getBytes());
        var judgment = CodeChallengeJudgment.builder().codeChallenge(challenge).passed(true)
                .codeLanguage(CodeChallengeLanguage.PYTHON3).code(encodedCode).codeByteSize(encodedCode.length())
                .submittedAt(LocalDateTime.now()).maxElapsedTimeMs(5).maxMemoryUsageMb(1.0f).build();
        when(judgmentRepository.findById(100L)).thenReturn(Optional.of(judgment));
        when(codeReviewRepository.findByJudgment_JudgmentIdAndReviewVersion(anyLong(), anyInt())).thenReturn(Optional.empty());

        when(mcpProperties.configured()).thenReturn(true);
        when(mcpProperties.pythonExecutable()).thenReturn("python");
        when(mcpProperties.serverScript()).thenReturn("/tmp/github_mcp_server.py");

        when(appClient.getInstallation(555L)).thenReturn(new GithubAppClient.InstallationInfo("octocat", "User", true));
        when(appClient.createInstallationToken(555L)).thenReturn("install-token");
        when(appClient.getDefaultBranchHeadSha("install-token", "octocat", "hello-world", "main")).thenReturn("base000");

        when(summaryClient.generate(any())).thenReturn(validSummary());
    }

    private SolutionSummaryContent validSummary() {
        return new SolutionSummaryContent("approach", "O(1)", "O(1)", List.of("n은 입력"), "한 줄 요약",
                new SolutionSummaryContent.ObservedMetrics(5, 1.0f));
    }

    @SuppressWarnings("unchecked")
    private GithubMcpClient.Session mockSuccessfulSession(String resultJson) throws Exception {
        var session = mock(GithubMcpClient.Session.class);
        when(session.callTool(eq("upload_solution"), any(Map.class), any())).thenReturn(resultJson);
        when(mcpClient.start(any(), any(), any(), any())).thenReturn(session);
        return session;
    }

    private String successResultJson() {
        return "{\"commitSha\":\"newcommit000\",\"commitUrl\":\"https://github.com/octocat/hello-world/commit/newcommit000\",\"solutionSha\":\"blobsha000\"}";
    }

    // ---- happy path -----------------------------------------------------------------

    @Test
    void successfulRunUploadsAndSavesCommitInfo() throws Exception {
        mockSuccessfulSession(successResultJson());

        runner.run(1L);

        assertThat(job.getStatus()).isEqualTo("COMPLETED");
        assertThat(job.getCommitSha()).isEqualTo("newcommit000");
        assertThat(job.getCommitUrl()).contains("newcommit000");
        assertThat(job.getSolutionBlobSha()).isEqualTo("blobsha000");
        assertThat(job.getSummaryJson()).contains("한 줄 요약");
    }

    @Test
    @SuppressWarnings("unchecked")
    void authorEmailUsesTheIdBasedNoreplyFormatNotAFreeEmail() throws Exception {
        var session = mockSuccessfulSession(successResultJson());

        runner.run(1L);

        var captor = org.mockito.ArgumentCaptor.forClass(Map.class);
        verify(session).callTool(eq("upload_solution"), captor.capture(), any());
        assertThat(captor.getValue().get("author_email")).isEqualTo("42+octocat@users.noreply.github.com");
        assertThat(captor.getValue().get("author_name")).isEqualTo("octocat");
        assertThat(captor.getValue().get("expected_base_sha")).isEqualTo("base000");
    }

    // ---- live re-validation -----------------------------------------------------------

    @Test
    void disabledSettingSkipsWithoutTouchingGithubAtAll() {
        when(settings.findByUserKey(1L)).thenReturn(Optional.of(disabledSetting()));

        runner.run(1L);

        assertThat(job.getStatus()).isEqualTo("SKIPPED");
        verifyNoInteractions(appClient);
        verifyNoInteractions(mcpClient);
    }

    private AutoSaveSettingEntity disabledSetting() {
        var s = new AutoSaveSettingEntity();
        s.setUserKey(1L); s.setEnabled(false);
        return s;
    }

    @Test
    void revokedConnectionSkipsWithoutTouchingGithubAtAll() {
        when(connections.findByUserKey(1L)).thenReturn(Optional.empty());

        runner.run(1L);

        assertThat(job.getStatus()).isEqualTo("SKIPPED");
        verifyNoInteractions(appClient);
    }

    @Test
    void missingWritePermissionFailsAsPermissionAndUpdatesTheCache() {
        when(appClient.getInstallation(555L)).thenReturn(new GithubAppClient.InstallationInfo("octocat", "User", false));

        runner.run(1L);

        assertThat(job.getStatus()).isEqualTo("FAILED");
        assertThat(job.getErrorCategory()).isEqualTo("PERMISSION");
        verifyNoInteractions(mcpClient);
        var connection = connections.findByUserKey(1L).orElseThrow();
        assertThat(connection.isWritePermissionGranted()).isFalse();
    }

    // ---- AI summary failure never blocks the commit --------------------------------

    @Test
    void summaryGenerationFailureStillUploadsWithTheDefaultDescription() throws Exception {
        when(summaryClient.generate(any())).thenThrow(new IllegalStateException("AI down"));
        mockSuccessfulSession(successResultJson());

        runner.run(1L);

        assertThat(job.getStatus()).isEqualTo("COMPLETED"); // the code was still saved
        assertThat(job.getSummaryJson()).contains("AI 요약을 생성하지 못했습니다");
    }

    // ---- idempotent retry: check before writing again ------------------------------

    @Test
    void retryFirstChecksWhetherTheEarlierAttemptsCommitAlreadyLanded() throws Exception {
        job.setAttemptCount(1); // claim bumps this to 2 -> "attemptCount > 1" branch
        when(appClient.findMatchingRecentCommit(eq("install-token"), eq("octocat"), eq("hello-world"), eq("main"),
                eq("python/0007-foo/solution.py"), anyString()))
                .thenReturn(Optional.of(new GithubAppClient.RecentCommit("already-committed-sha", "msg")));

        runner.run(1L);

        assertThat(job.getStatus()).isEqualTo("COMPLETED");
        assertThat(job.getCommitSha()).isEqualTo("already-committed-sha");
        verifyNoInteractions(mcpClient); // never writes again once it finds the earlier commit
    }

    @Test
    void firstAttemptNeverChecksForAPriorCommit() throws Exception {
        mockSuccessfulSession(successResultJson());

        runner.run(1L);

        verify(appClient, never()).findMatchingRecentCommit(any(), any(), any(), any(), any(), any());
    }

    // ---- failure classification & retry policy ---------------------------------------

    @Test
    void conflictFromTheWriteToolIsNeverAutoRetried() throws Exception {
        var session = mock(GithubMcpClient.Session.class);
        when(session.callTool(eq("upload_solution"), any(), any()))
                .thenThrow(new GithubMcpClient.McpToolError("[CONFLICT] branch moved"));
        when(mcpClient.start(any(), any(), any(), any())).thenReturn(session);

        runner.run(1L);

        assertThat(job.getStatus()).isEqualTo("FAILED");
        assertThat(job.getErrorCategory()).isEqualTo("CONFLICT");
        assertThat(job.getNextAttemptAt()).isNull(); // needs an explicit user retry, not auto-retried
    }

    @Test
    void transientFailureSchedulesABackoffRetry() throws Exception {
        var session = mock(GithubMcpClient.Session.class);
        when(session.callTool(eq("upload_solution"), any(), any()))
                .thenThrow(new GithubMcpClient.McpToolError("[TRANSIENT] rate limited"));
        when(mcpClient.start(any(), any(), any(), any())).thenReturn(session);

        runner.run(1L);

        assertThat(job.getStatus()).isEqualTo("FAILED");
        assertThat(job.getErrorCategory()).isEqualTo("TRANSIENT");
        assertThat(job.getNextAttemptAt()).isNotNull().isAfter(LocalDateTime.now());
    }

    @Test
    void transientFailureStopsAutoRetryingAfterTheAttemptCap() throws Exception {
        job.setAttemptCount(AutoCommitJobRunner.MAX_TRANSIENT_ATTEMPTS - 1); // claim bumps to the cap
        var session = mock(GithubMcpClient.Session.class);
        when(session.callTool(eq("upload_solution"), any(), any()))
                .thenThrow(new GithubMcpClient.McpToolError("[TRANSIENT] rate limited"));
        when(mcpClient.start(any(), any(), any(), any())).thenReturn(session);

        runner.run(1L);

        assertThat(job.getNextAttemptAt()).isNull(); // exhausted -- needs a manual retry now
    }

    @Test
    void unexpectedExceptionIsClassifiedUnknownAndNotAutoRetried() {
        when(appClient.getInstallation(555L)).thenThrow(new RuntimeException("boom"));

        runner.run(1L);

        assertThat(job.getStatus()).isEqualTo("FAILED");
        assertThat(job.getErrorCategory()).isEqualTo("UNKNOWN");
        assertThat(job.getNextAttemptAt()).isNull();
    }

    // ---- conflict guard uses the LAST successful write's own blob sha -------------

    @Test
    void expectedSolutionShaComesFromThePriorCompletedJobAtTheSamePath() throws Exception {
        var priorJob = new AutoCommitJobEntity();
        priorJob.setSolutionBlobSha("prior-blob-sha");
        when(jobs.findFirstByOwnerAndNameAndPathAndStatusOrderByIdDesc("octocat", "hello-world", "python/0007-foo", "COMPLETED"))
                .thenReturn(Optional.of(priorJob));
        var session = mockSuccessfulSession(successResultJson());

        runner.run(1L);

        var captor = org.mockito.ArgumentCaptor.forClass(Map.class);
        verify(session).callTool(eq("upload_solution"), captor.capture(), any());
        assertThat(captor.getValue().get("expected_solution_sha")).isEqualTo("prior-blob-sha");
    }
}
