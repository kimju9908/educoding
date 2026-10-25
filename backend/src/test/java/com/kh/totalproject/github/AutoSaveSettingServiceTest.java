package com.kh.totalproject.github;

import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeLanguage;
import com.kh.totalproject.entity.CodeChallenge;
import com.kh.totalproject.entity.CodeChallengeJudgment;
import com.kh.totalproject.exception.CodeReviewException;
import com.kh.totalproject.repository.CodeChallengeJudgmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

import static com.kh.totalproject.github.GithubModels.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AutoSaveSettingServiceTest {
    GithubConnectionRepository connections = mock(GithubConnectionRepository.class);
    GithubRepositoryRepository repositories = mock(GithubRepositoryRepository.class);
    AutoSaveSettingRepository settings = mock(AutoSaveSettingRepository.class);
    AutoCommitJobRepository jobs = mock(AutoCommitJobRepository.class);
    CodeChallengeJudgmentRepository judgmentRepository = mock(CodeChallengeJudgmentRepository.class);
    GithubUserLock userLock = mock(GithubUserLock.class);
    TransactionTemplate tx = mock(TransactionTemplate.class);
    AutoSaveSettingService service;
    List<AutoSaveSettingEntity> savedSettings = new ArrayList<>();

    @BeforeEach
    void setup() {
        service = new AutoSaveSettingService(connections, repositories, settings, jobs, judgmentRepository, userLock, tx);
        when(tx.execute(any())).thenAnswer(i -> ((TransactionCallback<?>) i.getArgument(0)).doInTransaction(null));

        var connection = new GithubConnectionEntity();
        connection.setId(10L);
        connection.setUserKey(1L);
        connection.setInstallationId(555L);
        when(connections.findByUserKey(1L)).thenReturn(Optional.of(connection));

        var repo = new GithubRepositoryEntity();
        repo.setId(5L); repo.setConnectionId(10L); repo.setOwner("octocat"); repo.setName("hello-world");
        when(repositories.findById(5L)).thenReturn(Optional.of(repo));

        when(settings.findByUserKey(1L)).thenAnswer(i -> savedSettings.isEmpty() ? Optional.empty() : Optional.of(savedSettings.get(0)));
        when(settings.save(any())).thenAnswer(i -> {
            AutoSaveSettingEntity s = i.getArgument(0);
            if (!savedSettings.contains(s)) savedSettings.add(s);
            return s;
        });
    }

    // ---- save ------------------------------------------------------------------

    @Test
    void savingWithoutABranchIsRejected() {
        assertThatThrownBy(() -> service.save(1L, new AutoSaveSettingRequest(5L, "", "")))
                .isInstanceOf(CodeReviewException.class);
    }

    @Test
    void savingARepositoryOutsideTheInstalledListIsRejected() {
        when(repositories.findById(999L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.save(1L, new AutoSaveSettingRequest(999L, "main", "")))
                .isInstanceOf(CodeReviewException.class);
    }

    @Test
    void savingNeverEnablesAutoSaveByItself() {
        var view = service.save(1L, new AutoSaveSettingRequest(5L, "main", "solutions"));

        assertThat(view.configured()).isTrue();
        assertThat(view.enabled()).isFalse();
        assertThat(view.owner()).isEqualTo("octocat");
        assertThat(view.basePath()).isEqualTo("solutions");
    }

    // ---- enable/disable ----------------------------------------------------------

    @Test
    void enablingWithoutSavedSettingsFirstIsRejected() {
        assertThatThrownBy(() -> service.enable(1L)).isInstanceOf(CodeReviewException.class);
    }

    @Test
    void enablingAfterSettingsAreSavedTurnsItOn() {
        service.save(1L, new AutoSaveSettingRequest(5L, "main", ""));

        var view = service.enable(1L);

        assertThat(view.enabled()).isTrue();
    }

    @Test
    void disablingWithNothingConfiguredDoesNotThrow() {
        assertThatCode(() -> service.disable(1L)).doesNotThrowAnyException();
    }

    // ---- preview -------------------------------------------------------------------

    @Test
    void previewWithoutAnyPassedSubmissionIsRejected() {
        service.save(1L, new AutoSaveSettingRequest(5L, "main", ""));
        when(judgmentRepository.findFirstByUser_UserKeyAndPassedTrueOrderByJudgmentIdDesc(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.preview(1L)).isInstanceOf(CodeReviewException.class);
    }

    @Test
    void previewUsesTheRealMostRecentPassedSubmissionAndComputedPath() {
        service.save(1L, new AutoSaveSettingRequest(5L, "main", ""));
        var challenge = new CodeChallenge();
        challenge.setChallengeId(7L); challenge.setTitle("구구단");
        String encoded = Base64.getEncoder().encodeToString("print(1)".getBytes());
        var judgment = CodeChallengeJudgment.builder()
                .codeChallenge(challenge).passed(true).codeLanguage(CodeChallengeLanguage.PYTHON3)
                .code(encoded).codeByteSize(encoded.length()).submittedAt(java.time.LocalDateTime.now()).build();
        when(judgmentRepository.findFirstByUser_UserKeyAndPassedTrueOrderByJudgmentIdDesc(1L)).thenReturn(Optional.of(judgment));

        var preview = service.preview(1L);

        assertThat(preview.path()).isEqualTo("python/0007-구구단");
        assertThat(preview.solutionFileName()).isEqualTo("solution.py");
        assertThat(preview.solutionContent()).isEqualTo("print(1)"); // decoded, not the raw base64
    }

    // ---- job retry -------------------------------------------------------------------

    @Test
    void retryingAnotherUsersJobIsRejected() {
        var job = new AutoCommitJobEntity();
        job.setId(1L); job.setUserKey(2L); job.setStatus("FAILED");
        when(jobs.findById(1L)).thenReturn(Optional.of(job));

        assertThatThrownBy(() -> service.retry(1L, 1L)).isInstanceOf(CodeReviewException.class);
    }

    @Test
    void retryingAJobThatIsNotFailedIsRejected() {
        var job = new AutoCommitJobEntity();
        job.setId(1L); job.setUserKey(1L); job.setStatus("COMPLETED");
        when(jobs.findById(1L)).thenReturn(Optional.of(job));

        assertThatThrownBy(() -> service.retry(1L, 1L)).isInstanceOf(CodeReviewException.class);
    }

    @Test
    void retryingAFailedJobResetsItToPendingAndClearsTheError() {
        var job = new AutoCommitJobEntity();
        job.setId(1L); job.setUserKey(1L); job.setStatus("FAILED");
        job.setErrorCategory("TRANSIENT"); job.setErrorMessage("timed out");
        when(jobs.findById(1L)).thenReturn(Optional.of(job));
        when(jobs.save(any())).thenAnswer(i -> i.getArgument(0));

        var view = service.retry(1L, 1L);

        assertThat(view.status()).isEqualTo("PENDING");
        assertThat(view.errorMessage()).isNull();
    }
}
