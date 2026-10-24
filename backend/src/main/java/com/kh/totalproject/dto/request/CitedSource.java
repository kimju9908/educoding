package com.kh.totalproject.dto.request;

/**
 * 과거 턴의 답변이 몇 번([citationNumber])에 어떤 자료(chunkId)를 인용했는지를 나타냅니다.
 * ChatTurn.sources로 RAG 서비스에 전달되어, "아까 [2]번 자료 더 설명해줘" 같은 후속 질문에서
 * 실제 자료를 다시 조회할 수 있게 합니다 (rag/service/retrieval.py의 CitedSource와 동일한 모양).
 * chunkId는 ChatbotSourceResponse.chunkId와 같은 값이며, 답변을 저장할 때 그 순서(=citationNumber)
 * 그대로 ChatMessage에 함께 저장됩니다 (RagChatbotService 참고).
 */
public record CitedSource(
    Integer citationNumber,
    String chunkId
) {}
