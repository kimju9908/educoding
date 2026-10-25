package com.kh.totalproject.dto.response;

import com.kh.totalproject.constant.codehint.CodeHintStatus;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 풀이 시도 1건의 힌트 상태. hints에는 공개된 단계만 담긴다 (미공개 단계는 서버에도 아직 없다).
 *
 * @param attemptId     아직 힌트를 요청한 적 없으면 null
 * @param judgmentId    오답 제출 기준이면 그 제출 ID, 제출 전 기준이면 null
 * @param revealedLevel 공개된 마지막 단계 (0~maxLevel)
 * @param pendingLevel  생성 중이거나 실패한 다음 단계 (READY면 null)
 */
public record CodeHintStateResponse(
        Long attemptId,
        Long challengeId,
        Long judgmentId,
        int revealedLevel,
        int maxLevel,
        CodeHintStatus status,
        Integer pendingLevel,
        String errorMessage,
        List<Item> hints
) {
    public record Item(int level, CodeHintContent content, LocalDateTime revealedAt, Long judgmentId, String question) {}
}
