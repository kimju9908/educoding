package com.kh.totalproject.dto.response;

/**
 * 챗봇 답변이 근거로 사용한 학습 자료 한 개를 가리키는 DTO입니다.
 * url은 프론트엔드 라우트 기준 상대 경로이며(예: /study/java/08/03?headingIndex=13),
 * 해당 레슨 페이지로 이동한 뒤 headingIndex가 가리키는 섹션까지 스크롤합니다.
 */
public record ChatbotSourceResponse(
    String language,
    String chapterTitle,
    String lessonLabel,
    String heading,
    Integer headingIndex,
    String url,
    Double score
) {}
