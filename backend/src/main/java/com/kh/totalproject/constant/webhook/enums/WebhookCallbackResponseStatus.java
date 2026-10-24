package com.kh.totalproject.constant.webhook.enums;

import lombok.Getter;

/**
 * 웹훅 콜백 HTTP 요청에 대한 응답 코드를 작업 결과와 매핑하여 관리하는 열거형입니다.
 * 콜백에 따른 작업(SSE 메시지 전달/DB 채점 결과 삽입)이 성공하지 못한 경우,
 * 스프링 부트는 즉시 SSE 자원을 정리하고, 웹훅 워커에게 4xx/5xx 코드로 응답합니다.
 * 4xx/5xx 응답 코드를 수신한 웹훅 워커는 코드 채점 작업을 종료합니다.
 */
@Getter
public enum WebhookCallbackResponseStatus {
    PROCEED(200),   // 작업 지속
    STOP(422),      // 작업 중단
    OK(200);        // 이벤트 수신 OK

    private final int statusCode;

    private WebhookCallbackResponseStatus(int statusCode) {
        this.statusCode = statusCode;
    }
}
