package com.kh.totalproject.github;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/** Picks up PENDING jobs (fresh outbox rows) and TRANSIENT failures whose backoff
 * window has elapsed, and hands each to AutoCommitJobRunner (a separate bean --
 * see its own javadoc for why @Async requires that). Same fixedRate style as the
 * existing OtpCleanUpService; @EnableScheduling is already on in ScheduleConfig,
 * so no new scheduling infrastructure is added here. */
@Component @RequiredArgsConstructor @Slf4j
public class AutoCommitJobScheduler {
    private final AutoCommitJobRepository jobs;
    private final AutoCommitJobRunner runner;

    @Scheduled(fixedRate = 15000) // 15초마다 처리 대기 작업 확인
    public void dispatchDueJobs() {
        var due = jobs.findDue(LocalDateTime.now());
        for (var job : due) {
            runner.run(job.getId());
        }
    }
}
