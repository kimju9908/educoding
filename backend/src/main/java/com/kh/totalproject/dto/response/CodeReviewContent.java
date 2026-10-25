package com.kh.totalproject.dto.response;

import java.util.List;

/**
 * RAG 서비스가 돌려준 AI 코드 리뷰 본문 (rag/service/review_graph.py의 ReviewResult와 같은 구조).
 * 검증을 통과한 것만 code_review.content_json에 저장되고, 그대로 클라이언트에 전달된다.
 */
public record CodeReviewContent(
        String summary,
        List<String> strengths,
        Complexity complexity,
        ObservedMetrics observedMetrics,
        List<Improvement> improvements,
        List<Lesson> lessons
) {
    public record Complexity(String time, String space, List<String> assumptions) {}

    // 채점 서버가 측정한 값 (모델이 만든 값이 아님)
    public record ObservedMetrics(Integer maxElapsedTimeMs, Float maxMemoryUsageMb) {}

    // kind: "suggestion"(개선 제안) | "bug"(실제 오류). exampleCode는 실행·검증되지 않은 예시.
    public record Improvement(String kind, String title, Integer lineStart, Integer lineEnd,
                              String detail, String exampleCode) {}

    public record Lesson(String chunkId, String title, String url) {}
}
