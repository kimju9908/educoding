package com.kh.totalproject.dto.request;

/**
 * 챗봇에게 질문을 보낼 때 사용하는 요청 DTO입니다.
 * language는 선택 값이며, 지정하면 해당 언어의 학습 자료로만 검색 범위를 제한합니다.
 * sessionId는 프론트에서 대화(챗봇 위젯)가 열릴 때 한 번 생성해서 매 질문마다 같이 보내는 값으로,
 * RagChatbotService가 이 값으로 이전 턴들을 불러와 멀티턴 대화를 이어갑니다. 생략하면(null)
 * 기존처럼 매 질문이 독립적으로 처리됩니다.
 */
public record AskChatbotRequest(
    String question,
    String language,
    String sessionId
) {}
