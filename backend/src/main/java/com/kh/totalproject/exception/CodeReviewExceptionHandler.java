package com.kh.totalproject.exception;

import com.kh.totalproject.controller.CodeHintController;
import com.kh.totalproject.controller.CodeReviewController;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.Map;

/**
 * AI 코드 리뷰·AI 힌트 API 전용 예외 처리 (StudyContentExceptionHandler와 같은 방식).
 * GlobalExceptionHandler보다 먼저, CodeReviewController·CodeHintController에 한해서만 가로채 알맞은 상태 코드로 응답한다.
 */
@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice(assignableTypes = {CodeReviewController.class, CodeHintController.class})
public class CodeReviewExceptionHandler {

    @ExceptionHandler(CodeReviewException.class)
    public ResponseEntity<Map<String, Object>> handleCodeReview(CodeReviewException ex) {
        return body(ex.getStatus(), ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return body(HttpStatus.BAD_REQUEST, "잘못된 요청 값입니다.");
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadable(HttpMessageNotReadableException ex) {
        return body(HttpStatus.BAD_REQUEST, "잘못된 요청 값입니다.");
    }

    @ExceptionHandler(UnauthenticatedException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthenticated(UnauthenticatedException ex) {
        return body(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
    }

    private ResponseEntity<Map<String, Object>> body(HttpStatus status, String message) {
        return ResponseEntity.status(status)
                .body(Map.of("status", status.value(), "message", message, "success", false));
    }
}
