package com.kh.totalproject.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class ElasticException extends RuntimeException {
    public ElasticException(String message) {
        super(message);
    }
}
