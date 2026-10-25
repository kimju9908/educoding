package com.kh.totalproject.dto.request;

import java.util.List;

/**
 * RAG 서비스 /hint/generate 요청 본문 (rag/service/hint_graph.py의 HintRequestContext와 같은 구조).
 * CodeHintService가 소유권·문제 일치·허용 단계를 확인한 뒤 DB 값으로 채운다.
 * 이번 단계보다 낮은 단계의 공개된 힌트만 담는다. 숨겨진 테스트·정답 코드·채점 stderr 원문은 자리가 없다.
 */
public record RagHintRequest(
        Integer level,
        RagReviewRequest.Challenge challenge,
        FailedSubmission submission,
        List<RevealedHint> revealedHints,
        String question,
        String language
) {
    public record FailedSubmission(
            Long submissionId,
            String language,
            String code,
            String failureCause,
            String failureSummary
    ) {}

    public record RevealedHint(Integer level, String text) {}
}
