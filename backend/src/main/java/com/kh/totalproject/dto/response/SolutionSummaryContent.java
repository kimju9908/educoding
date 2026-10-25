package com.kh.totalproject.dto.response;

import java.util.List;

/**
 * RAG 서비스가 돌려준 AI 풀이 요약 (rag/service/solution_summary_graph.py의 SummaryResult와
 * 같은 구조). README.md에 그대로 들어간다 -- AutoCommitJobRunner가 구조만 확인하고(필수 필드
 * 존재), 실행 시간/메모리는 이미 DB 관측값으로 채워져 있어 모델이 지어낼 수 없다.
 */
public record SolutionSummaryContent(
        String approach,
        String timeComplexity,
        String spaceComplexity,
        List<String> assumptions,
        String oneLineSummary,
        ObservedMetrics observedMetrics
) {
    public record ObservedMetrics(Integer maxElapsedTimeMs, Float maxMemoryUsageMb) {}
}
