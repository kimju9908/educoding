package com.kh.totalproject.github;

import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeLanguage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** The outbox half of docs/github-auto-commit.md section 3 -- this is about WHEN a
 * job gets queued, not the run itself (see AutoCommitJobRunnerTest). Called from
 * CodeChallengeJudgmentService in the same transaction as the judgment save; these
 * tests only check enqueueIfEnabled's own logic, not that transactional wiring
 * (there's no transaction to mock here -- it's local inserts only). */
class AutoCommitOutboxTest {
    AutoSaveSettingRepository settings = mock(AutoSaveSettingRepository.class);
    GithubConnectionRepository connections = mock(GithubConnectionRepository.class);
    AutoCommitJobRepository jobs = mock(AutoCommitJobRepository.class);
    AutoCommitOutbox outbox;

    @BeforeEach
    void setup() {
        outbox = new AutoCommitOutbox(settings, connections, jobs);
        when(jobs.findByJudgmentId(anyLong())).thenReturn(Optional.empty());
        var connection = new GithubConnectionEntity();
        connection.setUserKey(1L);
        connection.setInstallationId(555L);
        when(connections.findByUserKey(1L)).thenReturn(Optional.of(connection));
    }

    private AutoSaveSettingEntity enabledSetting() {
        var setting = new AutoSaveSettingEntity();
        setting.setUserKey(1L);
        setting.setOwner("octocat");
        setting.setName("hello-world");
        setting.setBranch("main");
        setting.setBasePath("");
        setting.setEnabled(true);
        return setting;
    }

    @Test
    void doesNothingWhenAutoSaveIsNotConfiguredAtAll() {
        when(settings.findByUserKey(1L)).thenReturn(Optional.empty());

        outbox.enqueueIfEnabled(1L, 100L, 7L, CodeChallengeLanguage.PYTHON3, "구구단");

        verify(jobs, never()).save(any());
    }

    @Test
    void doesNothingWhenAutoSaveIsConfiguredButDisabled() {
        var setting = enabledSetting();
        setting.setEnabled(false);
        when(settings.findByUserKey(1L)).thenReturn(Optional.of(setting));

        outbox.enqueueIfEnabled(1L, 100L, 7L, CodeChallengeLanguage.PYTHON3, "구구단");

        verify(jobs, never()).save(any());
    }

    @Test
    void doesNothingWhenTheConnectionIsNoLongerInstalled() {
        when(settings.findByUserKey(1L)).thenReturn(Optional.of(enabledSetting()));
        when(connections.findByUserKey(1L)).thenReturn(Optional.empty());

        outbox.enqueueIfEnabled(1L, 100L, 7L, CodeChallengeLanguage.PYTHON3, "구구단");

        verify(jobs, never()).save(any());
    }

    @Test
    void doesNothingWhenAJobForThisJudgmentAlreadyExists() {
        when(settings.findByUserKey(1L)).thenReturn(Optional.of(enabledSetting()));
        when(jobs.findByJudgmentId(100L)).thenReturn(Optional.of(new AutoCommitJobEntity()));

        outbox.enqueueIfEnabled(1L, 100L, 7L, CodeChallengeLanguage.PYTHON3, "구구단");

        verify(jobs, never()).save(any());
    }

    @Test
    void queuesAPendingJobSnapshottingTheCurrentSettingAndComputedPath() {
        when(settings.findByUserKey(1L)).thenReturn(Optional.of(enabledSetting()));

        outbox.enqueueIfEnabled(1L, 100L, 7L, CodeChallengeLanguage.PYTHON3, "구구단");

        var captor = org.mockito.ArgumentCaptor.forClass(AutoCommitJobEntity.class);
        verify(jobs).save(captor.capture());
        var job = captor.getValue();
        assertThat(job.getUserKey()).isEqualTo(1L);
        assertThat(job.getJudgmentId()).isEqualTo(100L);
        assertThat(job.getChallengeId()).isEqualTo(7L);
        assertThat(job.getStatus()).isEqualTo("PENDING");
        assertThat(job.getOwner()).isEqualTo("octocat");
        assertThat(job.getName()).isEqualTo("hello-world");
        assertThat(job.getBranch()).isEqualTo("main");
        assertThat(job.getPath()).isEqualTo("python/0007-구구단");
        assertThat(job.getAttemptCount()).isZero();
    }

    @Test
    void neverThrowsEvenIfARepositoryBlowsUp() {
        when(settings.findByUserKey(1L)).thenThrow(new RuntimeException("db hiccup"));

        assertThatCode(() -> outbox.enqueueIfEnabled(1L, 100L, 7L, CodeChallengeLanguage.PYTHON3, "구구단"))
                .doesNotThrowAnyException(); // never let an outbox bug break judgment persistence (section 3)
    }
}
