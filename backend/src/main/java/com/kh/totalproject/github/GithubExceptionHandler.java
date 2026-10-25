package com.kh.totalproject.github;

import com.kh.totalproject.exception.CodeReviewException;
import com.kh.totalproject.exception.UnauthenticatedException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/** Mirrors LearningPlanExceptionHandler -- scoped to just these two controllers. */
@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice(assignableTypes = {GithubConnectionController.class, GithubAnalysisController.class, AutoSaveSettingController.class})
public class GithubExceptionHandler {
    @ExceptionHandler(CodeReviewException.class)
    public ResponseEntity<?> code(CodeReviewException ex) {
        return ResponseEntity.status(ex.getStatus()).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(UnauthenticatedException.class)
    public ResponseEntity<?> auth() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "로그인이 필요합니다."));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> bad() {
        return ResponseEntity.badRequest().body(Map.of("message", "잘못된 요청 값입니다."));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> illegal(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }
}
