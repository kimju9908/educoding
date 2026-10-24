package com.kh.totalproject.controller;

import co.elastic.clients.elasticsearch._types.ElasticsearchException;
import com.kh.totalproject.exception.DuplicateResourceException;
import com.kh.totalproject.exception.ElasticException;
import com.kh.totalproject.exception.InvalidValueException;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.Map;

@Slf4j
@ControllerAdvice
public class CustomExceptionController {
    // 400 Bad Request (잘못된 요청)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
        log.error(ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("status", 400, "message", ex.getMessage(), "success", false));
    }

    // 400 Bad Request (잘못된 값을 전달)
    @ExceptionHandler(InvalidValueException.class)
    public ResponseEntity<?> handleInvalidValue(InvalidValueException ex) {
        log.error(ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("status", 400, "message", ex.getMessage(), "success", false));
    }

    // 401 Unauthorized (로그인 필요)
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<?> handleUnauthorized(SecurityException ex) {
        log.error(ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("status", 401, "message", "로그인이 필요 합니다", "success", false));
    }

    // 403 Forbidden (권한 없음)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleForbidden(AccessDeniedException ex) {
        log.error(ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of("status", 403, "message", ex.getMessage(), "success", false));
    }

    // 404 Not Found (엔티티를 찾을 수 없음)
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<?> handleEntityNotFound(EntityNotFoundException ex) {
        log.error(ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("status", 404, "message", ex.getMessage(), "success", false));
    }

    // 404 Not Found (리소스를 찾을 수 없음)
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<?> handleNoResourceFound(NoResourceFoundException ex) {
        log.error(ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("status", 404, "message", "리소스를 찾을 수 없습니다", "success", false));
    }

    // 409 Duplicate (중복된 데이터)
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<?> handleDuplicate(DuplicateResourceException ex) {
        log.error(ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("status", 409, "message", ex.getMessage(), "success", false));
    }

    // 500 Internal Server Error (데이터 베이스 관련 오류)
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<?> handleDatabaseAccess(DataAccessException ex) {
        log.error(ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("status", 500, "message", "데이터 베이스 관련 에러 발생", "success", false));
    }

    // 500 Internal Server Error (엘라스틱 관련 오류)
    @ExceptionHandler(ElasticException.class)
    public ResponseEntity<?> handleElasticsearch(ElasticException ex) {
        log.error(ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("status", 500, "message", "엘라스틱서치 관련 에러 발생", "success", false));
    }
}
