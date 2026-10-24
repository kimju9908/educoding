package com.kh.totalproject.dto.response;

/**
 * 챗봇 답변이 근거로 사용한 학습 자료 한 개를 가리키는 DTO입니다.
 * url은 프론트엔드 라우트 기준 상대 경로이며(예: /study/java/08/03?headingIndex=13),
 * 해당 레슨 페이지로 이동한 뒤 headingIndex가 가리키는 섹션까지 스크롤합니다.
 * chunkId는 이 자료의 원본 식별자로(RAG 서비스의 study_chunks 문서 id와 동일), 답변을
 * 저장할 때 이 리스트의 순서(=citationNumber)와 함께 ChatMessage에 보관되어, 다음 턴에서
 * "아까 [n]번 자료" 같은 질문을 받으면 그 자료를 다시 조회하는 데 쓰입니다 (CitedSource 참고).
 */
public record ChatbotSourceResponse(
    String chunkId,
    String language,
    String chapterTitle,
    String lessonLabel,
    String heading,
    Integer headingIndex,
    String url,
    Double score
) {}
