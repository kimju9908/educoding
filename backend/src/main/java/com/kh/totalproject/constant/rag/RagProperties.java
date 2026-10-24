package com.kh.totalproject.constant.rag;

/**
 * RAG 챗봇 서비스(Python/FastAPI)와의 통신에 필요한 구성 정보를 담는 불변 레코드 클래스입니다.
 * FlaskProperties와 동일한 역할이며, judge 서비스 대신 rag 서비스를 가리킵니다.
 * apiKey/clientId는 로컬 개발에서 인증을 끈 경우 비워둘 수 있습니다(RagChatbotService 참고).
 * anthropicApiKey는 Claude 호출용 키로, RAG 서비스 자체는 보관하지 않고 백엔드가 요청마다
 * X-Anthropic-Api-Key 헤더로 전달합니다 -- 키를 백엔드 한 곳에서만 관리하기 위함입니다.
 */
public record RagProperties(
    String host,            // RAG 서비스 호스트 주소
    String apiKey,           // RAG 서비스 호출 시 인증에 사용되는 API 키 (선택)
    String clientId,          // RAG 서비스 호출 시 클라이언트 식별을 위한 ID (선택)
    String anthropicApiKey     // Claude API 키 (ANTHROPIC_API_KEY, 선택 -- 비어 있으면 챗봇 답변 생성 단계에서 503)
) {
    public RagProperties {
        if (host == null || host.isEmpty()) {
            throw new IllegalArgumentException("RAG 서비스 Host 주소는 필수 값입니다");
        }
    }
}
