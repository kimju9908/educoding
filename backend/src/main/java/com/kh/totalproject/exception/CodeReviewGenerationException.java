package com.kh.totalproject.exception;

// AI 코드 리뷰 생성 실패 (RAG 서비스 오류·지연, 응답 형식 오류). 메시지는 사용자에게 그대로 보여줄 수 있는 문장.
public class CodeReviewGenerationException extends RuntimeException {
    public CodeReviewGenerationException(String message) {
        super(message);
    }
}
