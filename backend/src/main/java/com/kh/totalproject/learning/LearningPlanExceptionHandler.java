package com.kh.totalproject.learning;

import com.kh.totalproject.exception.CodeReviewException;
import com.kh.totalproject.exception.UnauthenticatedException;
import org.springframework.core.annotation.Order;
import org.springframework.core.Ordered;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MissingServletRequestParameterException;
import java.util.Map;

@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice(assignableTypes=LearningPlanController.class)
public class LearningPlanExceptionHandler {
    @ExceptionHandler(CodeReviewException.class)
    public ResponseEntity<?> code(CodeReviewException ex) { return ResponseEntity.status(ex.getStatus()).body(Map.of("message",ex.getMessage())); }
    @ExceptionHandler(UnauthenticatedException.class)
    public ResponseEntity<?> auth() { return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message","로그인이 필요합니다.")); }
    @ExceptionHandler({HttpMessageNotReadableException.class,MissingServletRequestParameterException.class})
    public ResponseEntity<?> bad() { return ResponseEntity.badRequest().body(Map.of("message","언어·수준·목표를 확인해주세요.")); }
}
