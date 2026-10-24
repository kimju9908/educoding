package com.kh.totalproject.exception;

import lombok.Getter;
import org.springframework.http.converter.HttpMessageNotReadableException;

/**
 * RestTemplate를 사용하여 외부 API(예: Flask)와 통신하는 과정에서
 * 응답의 역직렬화(deserialization)가 실패하는 경우 HttpMessageNotReadableException 예외가 발생합니다.
 * 이때 요청 URL에 대한 정보를 유지할 수 있도록 URL 정보와 함께
 * HttpMessageNotReadableException을 래핑한 커스텀 예외 클래스입니다.
 */
@Getter
public class CustomHttpMessageNotReadableException extends RuntimeException {
  private final HttpMessageNotReadableException originalException;
  private final String requestUrl;

  public CustomHttpMessageNotReadableException(HttpMessageNotReadableException originalException, String requestUrl) {
    super("Failed to deserialize response from " + requestUrl, originalException);
    this.originalException = originalException;
    this.requestUrl = requestUrl;
  }
}