package com.kh.totalproject.exception;

import com.kh.totalproject.controller.AuthController;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * 회원가입/로그인 API 전용 예외 처리.
 * GlobalExceptionHandler는 이런 예외를 전부 500 "서버 내부 오류"로 돌려줘서 사용자에게 원인을 보여줄 수 없었다.
 * AuthController에 한해서만 먼저 가로채 알맞은 상태 코드와 메시지를 내려준다.
 */
@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice(assignableTypes = AuthController.class)
public class AuthExceptionHandler {

    @ExceptionHandler(InvalidValueException.class)
    public ResponseEntity<Map<String, Object>> handleInvalid(InvalidValueException ex) {
        return body(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicate(DuplicateResourceException ex) {
        return body(HttpStatus.CONFLICT, ex.getMessage());
    }

    // 문자 발송·이미지 업로드 같은 외부 서비스 실패
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleUnavailable(IllegalStateException ex) {
        return body(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> body(HttpStatus status, String message) {
        return ResponseEntity.status(status)
                .body(Map.of("status", status.value(), "message", message, "success", false));
    }
}
