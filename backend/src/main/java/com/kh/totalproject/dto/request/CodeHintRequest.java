package com.kh.totalproject.dto.request;

/**
 * 클라이언트의 힌트 요청 본문. 사용자 ID는 받지 않는다 (JWT에서 꺼냄).
 * level은 "열고 싶은 단계"일 뿐이고, 실제로 생성할 수 있는지는 CodeHintService가 저장된 공개 단계로 결정한다.
 *
 * @param judgmentId 오답 제출 기준 힌트면 그 제출 ID, 제출 전 힌트면 null
 * @param language   에디터에서 고른 언어(CodeChallengeLanguage) -- 제출 전 힌트의 관련 강의 검색에만 쓴다
 * @param question   선택 질문 (최대 300자). 공개 범위를 바꾸지 않는다.
 */
public record CodeHintRequest(Long challengeId, Long judgmentId, Integer level, String language, String question) {}
