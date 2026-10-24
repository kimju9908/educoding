package com.kh.totalproject.dto.request;

import java.util.List;

/**
 * 대화 히스토리 한 턴. role은 Claude 메시지 역할과 그대로 맞춘 "user" / "assistant" 소문자 문자열입니다
 * (RagChatbotService에서 ChatRole enum을 변환해 채웁니다).
 * sources는 role="assistant"일 때만 의미가 있으며, 그 답변이 인용한 자료들을 citationNumber
 * 순서대로 담습니다 -- RAG 서비스가 과거 턴의 인용을 가리키는 후속 질문을 처리할 때 씁니다
 * (CitedSource, ChatMessage.sourcesJson 참고). 출처 정보가 없는 턴(USER, 또는 이 기능 전에
 * 저장된 ASSISTANT 메시지)은 빈 리스트입니다.
 */
public record ChatTurn(
    String role,
    String content,
    List<CitedSource> sources
) {}
