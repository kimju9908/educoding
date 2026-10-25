package com.kh.totalproject.learning;

import java.time.LocalDateTime;
import java.util.List;

public final class LearningModels {
    private LearningModels() {}
    public record Profile(String language, String level, String goal) {}
    public record Outcome(long challengeId, boolean passed, String failure, LocalDateTime at) {}
    public record HintUse(long challengeId, int level, LocalDateTime at) {}
    public record ConceptSummary(String concept, int attempted, int unresolved, int resolved,
                                 int hintedUnresolved, int score, String evidence) {}
    public record Candidate(String id, String kind, String contentId, String title, String url,
                            String concept, String reason, int stage) {}
    public record Snapshot(Profile profile, LocalDateTime asOf, String fingerprint,
                           List<ConceptSummary> summary, List<Candidate> candidates,
                           int taggedChallenges, int totalChallenges, int availableLessons, String notice) {}
    // Model returns IDs only. Titles, links and evidence always come from the server catalog.
    public record Selection(List<String> candidateIds) {}
    public record Plan(Long id, int rulesVersion, LocalDateTime asOf, LocalDateTime generatedAt,
                       Profile profile, String source, boolean stale, boolean generating,
                       List<ConceptSummary> evidence, List<Candidate> steps, String notice) {}
}
