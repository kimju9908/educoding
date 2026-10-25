package com.kh.totalproject.github;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** One row per analysis attempt (new row on retry -- history is preserved, same
 * convention as learning_plan). reposJson pins the exact repos/HEAD SHAs this
 * attempt analyzed; resultJson is the raw rag-service response (DiagnoseResponse)
 * -- recommendedTopics is re-linked against the live catalog at read time
 * (GithubCatalogLinker), never stored resolved, so a later catalog change is
 * reflected without calling AI again (same pattern as LearningPlanService.view()). */
@Entity
@Table(name = "github_analysis", indexes = @Index(name = "idx_github_analysis_owner", columnList = "user_key,analysis_id"))
@Getter @Setter @NoArgsConstructor
public class GithubAnalysisEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "analysis_id")
    private Long id;

    @Column(name = "user_key", nullable = false)
    private Long userKey;

    @Column(name = "connection_id", nullable = false)
    private Long connectionId;

    @Column(nullable = false, length = 20)
    private String status; // PENDING / RUNNING / COMPLETED / FAILED / CANCELLED

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Lob @Column(name = "repos_json", columnDefinition = "LONGTEXT", nullable = false)
    private String reposJson;

    @Lob @Column(name = "result_json", columnDefinition = "LONGTEXT")
    private String resultJson;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(name = "cancel_requested", nullable = false)
    private boolean cancelRequested;
}
