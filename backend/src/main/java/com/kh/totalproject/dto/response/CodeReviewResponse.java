package com.kh.totalproject.dto.response;

import com.kh.totalproject.constant.codereview.CodeReviewStatus;

/**
 * AI 코드 리뷰 조회/요청 응답.
 * status가 null이면 아직 리뷰를 요청한 적 없는 제출, COMPLETED일 때만 review가 채워진다.
 */
public record CodeReviewResponse(
        Long judgmentId,
        Integer reviewVersion,
        CodeReviewStatus status,
        CodeReviewContent review,
        String errorMessage
) {}
