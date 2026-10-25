package com.kh.totalproject.github;

import java.time.LocalDateTime;
import java.util.List;

/** DTOs shared by the GitHub connection/analysis services and controllers.
 * Field names inside Diagnose* mirror rag/service/github_graph.py's Pydantic
 * models exactly (camelCase) so Jackson deserializes the Python response with
 * no mapping code -- see docs/github-diagnosis.md section 4. */
public final class GithubModels {
    private GithubModels() {}

    public record AllowedRepoRef(String owner, String repo, String headSha) {}

    // id is our own GithubRepositoryEntity PK -- what POST /repositories/select's
    // repoIds must send back. githubRepoId is GitHub's own numeric id, informational
    // only; the two are different numbering spaces and must not be confused.
    public record RepoView(long id, long githubRepoId, String owner, String name, String defaultBranch, boolean selected) {}

    public record ConnectionView(boolean loggedIn, String githubLogin, boolean installed,
                                 String installationAccountLogin, List<RepoView> repositories, String manageUrl,
                                 boolean writePermissionGranted, String writePermissionUpgradeUrl) {}

    // ---- what rag/service's /github/diagnose expects/returns (Python-shaped) --
    public record DiagnoseRequest(List<AllowedRepoRef> allowedRepos, String githubLogin, List<String> allowedConcepts) {}
    public record EvidenceRef(String owner, String repo, String path, String commitSha, Integer lineStart, Integer lineEnd) {}
    public record ConfirmedItem(String concept, String evidenceSummary, List<EvidenceRef> evidenceRefs, String limits) {}
    public record GapItem(String concept, String note) {}
    public record RawRecommendedTopic(String concept, String reason) {}
    public record ActualScope(List<AllowedRepoRef> reposAnalyzed, int listDirectoryCalls, int fileReadCalls,
                              int commitCalls, boolean truncated) {}
    public record DiagnoseResponse(List<ConfirmedItem> confirmed, List<GapItem> gaps,
                                   List<RawRecommendedTopic> recommendedTopics, String scopeNote, ActualScope actualScope) {}

    // ---- what the backend serves to the frontend (catalog-linked) -------------
    public record RecommendedTopic(String concept, String reason, boolean supported,
                                   String lessonUrl, String lessonTitle, String challengeUrl, String challengeTitle) {}
    public record AnalysisView(Long id, String status, List<AllowedRepoRef> repos, LocalDateTime requestedAt,
                               LocalDateTime completedAt, boolean generating, List<ConfirmedItem> confirmed,
                               List<GapItem> gaps, List<RecommendedTopic> recommendedTopics, String scopeNote,
                               ActualScope actualScope, String errorMessage, String notice) {}

    // ---- auto-commit (docs/github-auto-commit.md) -----------------------------

    public record AutoSaveSettingView(boolean configured, boolean enabled, Long repositoryId, String owner,
                                      String name, String branch, String basePath, boolean writePermissionGranted,
                                      String writePermissionUpgradeUrl) {}

    public record AutoSaveSettingRequest(long repositoryId, String branch, String basePath) {}

    public record AutoCommitPreview(String path, String solutionFileName, String solutionContent, String readmePreview) {}

    public record AutoCommitJobView(Long id, Long judgmentId, Long challengeId, String status, String errorCategory,
                                    String errorMessage, String owner, String name, String branch, String path,
                                    String commitSha, String commitUrl, LocalDateTime createdAt,
                                    LocalDateTime updatedAt, int attemptCount) {}
}
