package com.kh.totalproject.dto.response;

import java.time.LocalDateTime;

// 힌트 기준으로 고를 수 있는 본인의 오답 제출 1건 (코드·실패 상세는 담지 않음)
public record HintSubmissionResponse(Long judgmentId, LocalDateTime submittedAt, String language, String failureCause) {}
