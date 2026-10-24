package com.kh.totalproject.dto.request;

/**
 * 챗봇에게 질문을 보낼 때 사용하는 요청 DTO입니다.
 * language는 선택 값이며, 지정하면 해당 언어의 학습 자료로만 검색 범위를 제한합니다.
 */
public record AskChatbotRequest(
    String question,
    String language
) {}
