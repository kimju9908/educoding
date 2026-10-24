package com.kh.totalproject.dto.request;

/**
 * 대화 히스토리 한 턴. role은 Claude 메시지 역할과 그대로 맞춘 "user" / "assistant" 소문자 문자열입니다
 * (RagChatbotService에서 ChatRole enum을 변환해 채웁니다).
 */
public record ChatTurn(
    String role,
    String content
) {}
