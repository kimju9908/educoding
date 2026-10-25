package com.kh.totalproject.constant.codereview;

// AI 코드 리뷰 생성 상태
public enum CodeReviewStatus {
    PENDING,    // 생성 중 (RAG 서비스 호출 중)
    COMPLETED,  // 생성 완료 -- contentJson에 검증된 리뷰가 저장됨
    FAILED      // 생성 실패 -- errorMessage에 사유, 다시 요청하면 재시도
}
