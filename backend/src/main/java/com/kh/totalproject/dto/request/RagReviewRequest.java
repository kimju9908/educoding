package com.kh.totalproject.dto.request;

/**
 * RAG 서비스 /review/generate 요청 본문.
 * CodeReviewService가 소유권과 통과 여부를 확인한 뒤 DB 값으로만 채운다 (클라이언트 입력 사용 X).
 * 숨겨진 테스트 케이스와 정답 코드는 이 구조에 아예 자리가 없다 -- 보내지 않는다.
 */
public record RagReviewRequest(Submission submission, Challenge challenge) {
    public record Submission(
            Long submissionId,
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
            String difficulty,
            Integer timeLimitMs,
            Float memoryLimitMb
    ) {}
}
