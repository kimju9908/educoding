package com.kh.totalproject.dto.response;

// judge 작업 ID로 찾은 "방금 채점한 제출" 정보 (AI 코드 리뷰 대상)
public record ReviewTargetResponse(Long judgmentId, Long challengeId, boolean passed) {}
