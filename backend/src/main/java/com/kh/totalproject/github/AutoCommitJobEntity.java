package com.kh.totalproject.github;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** One row per judgment, created in the SAME transaction as that judgment's save
 * (CodeChallengeJudgmentService.saveJudgmentHistory) -- see docs/github-auto-commit.md
 * section 3. The unique constraint on judgmentId is what actually prevents a
 * duplicate webhook delivery from creating two jobs. owner/branch/path are a
 * SNAPSHOT of AutoSaveSettingEntity at creation time, not a live reference --
 * a later settings change doesn't retarget an already-queued job. */
@Entity
@Table(name = "github_auto_commit_job",
        uniqueConstraints = @UniqueConstraint(name = "uk_auto_commit_job_judgment", columnNames = "judgment_id"),
        indexes = @Index(name = "idx_auto_commit_job_owner", columnList = "user_key,job_id"))
@Getter @Setter @NoArgsConstructor
public class AutoCommitJobEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "job_id")
    private Long id;

    @Column(name = "user_key", nullable = false)
    private Long userKey;

    @Column(name = "judgment_id", nullable = false)
    private Long judgmentId;

    @Column(name = "challenge_id", nullable = false)
    private Long challengeId;

    @Column(nullable = false, length = 20)
    private String status; // PENDING / RUNNING / COMPLETED / FAILED / SKIPPED

    // TRANSIENT (auto-retried with backoff) / PERMISSION / CONFLICT / UNKNOWN. Null unless FAILED.
    @Column(name = "error_category", length = 20)
    private String errorCategory;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(nullable = false, length = 100)
    private String owner;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String branch;

    // Challenge folder path, e.g. "python/0042-구구단" -- solution.py/README.md live under it.
    @Column(nullable = false, length = 300)
    private String path;

    @Lob @Column(name = "summary_json", columnDefinition = "LONGTEXT")
    private String summaryJson;

    @Column(name = "summary_version")
    private Integer summaryVersion;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @Column(name = "next_attempt_at")
    private LocalDateTime nextAttemptAt;

    @Column(name = "commit_sha", length = 64)
    private String commitSha;

    // The solution file's own git blob sha after a successful upload -- how the NEXT
    // job targeting the same path tells "still what I last wrote" apart from "the user
    // edited it on GitHub since" (docs/github-auto-commit.md section 6).
    @Column(name = "solution_blob_sha", length = 64)
    private String solutionBlobSha;

    @Column(name = "commit_url", length = 300)
    private String commitUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}
