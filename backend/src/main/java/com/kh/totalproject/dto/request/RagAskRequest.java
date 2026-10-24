package com.kh.totalproject.dto.request;

import java.util.List;

/**
 * RAG 서비스(FastAPI)로 보내는 실제 요청 바디입니다. 프론트가 보낸 AskChatbotRequest의
 * sessionId를 그대로 넘기지 않고, RagChatbotService가 그 sessionId로 DB에서 불러온
 * 최근 히스토리를 history로 채워서 보냅니다 (rag/service/main.py의 AskRequest와 동일한 모양).
 */
public record RagAskRequest(
    String question,
    String language,
    List<ChatTurn> history
) {}
