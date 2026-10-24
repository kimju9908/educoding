package com.kh.totalproject.exception;

// Flask나 Celery Worker에서 보낸 응답이 기대하는 형태가 아닌 경우 사용
public class InvalidResponseBodyException extends RuntimeException {
    public InvalidResponseBodyException(String message) {
        super(message);
    }
}
