package com.kh.totalproject.dto.request;

import java.util.List;

/**
 * RAG 서비스 /solution-summary/generate 요청 본문 (rag/service/solution_summary_graph.py의
 * SummaryRequest와 같은 구조). AutoCommitJobRunner가 judgmentId로 조회한 DB 값으로만 채운다.
 * existingReview는 바로 그 judgmentId의 완료된 CodeReview가 있을 때만 채워진다 -- 다른 제출의
 * 리뷰가 섞일 자리가 없다.
 */
public record RagSolutionSummaryRequest(Submission submission, Challenge challenge, ExistingReview existingReview) {
    public record Submission(
            Long judgmentId,
            String language,
            String code,
            Integer maxElapsedTimeMs,
            Float maxMemoryUsageMb
    ) {}

    public record Challenge(
            Long challengeId,
            String title,
            String description,
            String condition,
            String category,
            String difficulty
    ) {}

    public record ExistingReview(String summary, String complexityTime, String complexitySpace, List<String> assumptions) {}
}
