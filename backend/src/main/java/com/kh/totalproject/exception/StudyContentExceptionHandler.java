package com.kh.totalproject.exception;

import com.kh.totalproject.controller.AdminStudyController;
import com.kh.totalproject.controller.StudyContentController;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.NoSuchElementException;

/**
 * 강의 콘텐츠 API 전용 예외 처리.
 * GlobalExceptionHandler는 이 예외들을 전부 500으로 돌려주기 때문에, 이 두 컨트롤러에 한해서만
 * 먼저(HIGHEST_PRECEDENCE) 가로채서 알맞은 상태 코드와 메시지로 응답한다.
 */
@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice(assignableTypes = {StudyContentController.class, AdminStudyController.class})
public class StudyContentExceptionHandler {

    @ExceptionHandler(InvalidValueException.class)
    public ResponseEntity<Map<String, Object>> handleInvalid(InvalidValueException ex) {
        return body(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NoSuchElementException ex) {
        return body(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicate(DuplicateResourceException ex) {
        return body(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleForbidden(AccessDeniedException ex) {
        return body(HttpStatus.FORBIDDEN, "관리자만 사용할 수 있습니다.");
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
