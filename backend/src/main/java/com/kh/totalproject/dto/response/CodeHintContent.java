package com.kh.totalproject.dto.response;

import java.util.List;

/**
 * 힌트 1단계 본문 (rag/service/hint_graph.py의 HintResult와 같은 구조). 단계마다 채워지는 필드가 다르다.
 *  - 1단계: concepts, guidingQuestions
 *  - 2단계: approach, dataStructures
 *  - 3단계: steps, pseudocode(선택)
 * failureInsight는 오답 제출 기준 힌트에서만, speculative=true면 추정이다.
 */
public record CodeHintContent(
        Integer level,
        String summary,
        List<String> concepts,
        List<String> guidingQuestions,
        String approach,
        List<DataStructure> dataStructures,
        List<String> steps,
        String pseudocode,
        FailureInsight failureInsight,
        List<CodeReviewContent.Lesson> lessons
) {
    public record DataStructure(String name, String reason) {}

    public record FailureInsight(String text, Boolean speculative) {}
}
