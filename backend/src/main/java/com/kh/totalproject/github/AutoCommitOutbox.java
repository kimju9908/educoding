package com.kh.totalproject.github;

import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeLanguage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/** The outbox half of docs/github-auto-commit.md section 3. Called from
 * CodeChallengeJudgmentService.saveJudgmentHistory, inside the SAME @Transactional
 * method/transaction as the judgment row's own save -- that's what makes "judgment
 * saved" and "job queued" atomic, with no separate commit step in between where one
 * could succeed without the other. This does only a local INSERT, no external
 * calls, so it can't meaningfully slow down or fail the webhook response. */
@Component @RequiredArgsConstructor @Slf4j
public class AutoCommitOutbox {
    private final AutoSaveSettingRepository settings;
    private final GithubConnectionRepository connections;
    private final AutoCommitJobRepository jobs;

    public void enqueueIfEnabled(Long userKey, Long judgmentId, Long challengeId,
                                  CodeChallengeLanguage language, String challengeTitle) {
        try {
            var setting = settings.findByUserKey(userKey).filter(AutoSaveSettingEntity::isEnabled).orElse(null);
            if (setting == null) return;
            // Cheap, local, no external call -- just avoids queuing a job that would only
            // SKIP at run time anyway. The authoritative re-check still happens at run time
            // (AutoCommitJobRunner), since this connection could change between now and then.
            boolean stillInstalled = connections.findByUserKey(userKey).map(GithubConnectionEntity::isInstalled).orElse(false);
            if (!stillInstalled) return;
            if (jobs.findByJudgmentId(judgmentId).isPresent()) return; // defensive; the DB unique constraint is the real guard

            var job = new AutoCommitJobEntity();
            job.setUserKey(userKey);
            job.setJudgmentId(judgmentId);
            job.setChallengeId(challengeId);
            job.setStatus("PENDING");
            job.setOwner(setting.getOwner());
            job.setName(setting.getName());
            job.setBranch(setting.getBranch());
            job.setPath(AutoCommitPaths.challengeFolder(setting.getBasePath(), language, challengeId, challengeTitle));
            job.setAttemptCount(0);
            var now = LocalDateTime.now();
            job.setCreatedAt(now);
            job.setUpdatedAt(now);
            jobs.save(job);
        } catch (Exception e) {
            // Never let an auto-commit bug roll back or fail a real grading result (see
            // docs/github-auto-commit.md section 3: "GitHub나 AI 실패가 기존 채점 성공을
            // 취소하거나 결과 표시를 지연시키지 않게 한다"). Worst case of swallowing this is
            // one missed auto-commit for one submission, not a lost judgment.
            log.warn("Failed to enqueue auto-commit job for judgment {}: {}", judgmentId, e.getClass().getSimpleName());
        }
    }
}
