package com.kh.totalproject.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

// AI 코드 리뷰 API 전용 예외 -- 응답 상태 코드를 직접 들고 다닌다 (CodeReviewExceptionHandler 참고)
@Getter
public class CodeReviewException extends RuntimeException {
    private final HttpStatus status;

    public CodeReviewException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }
}
