package com.kh.totalproject.exception;

import lombok.Getter;
import org.springframework.web.client.HttpServerErrorException;

import java.nio.charset.StandardCharsets;

/**
 * RestTemplate를 사용하여 Flask와 통신하는 과정에서 5xx 응답을 수신하는 경우
 * HttpServerErrorException 예외가 발생합니다.
 * 이때 요청 URL에 대한 정보를 유지할 수 있도록 URL 정보와 함께
 * HttpServerErrorException를 래핑한 커스텀 예외 클래스입니다.
 */
@Getter
public class CustomHttpServerErrorException extends HttpServerErrorException {
    private final String requestUrl;

    public CustomHttpServerErrorException(HttpServerErrorException ex, String requestUrl) {
        super(ex.getStatusCode(), ex.getStatusText(), ex.getResponseHeaders(), ex.getResponseBodyAsByteArray(), StandardCharsets.UTF_8);
        this.requestUrl = requestUrl;
    }
}
