package com.kh.totalproject.config;

import com.kh.totalproject.constant.rag.RagProperties;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RAG 챗봇 서비스 연결에 필요한 구성 정보를 제공하는 Spring Configuration 클래스입니다.
 * FlaskApiConfig와 동일한 역할이며, 환경 변수에서 RAG_* 값을 로드합니다.
 */
@Configuration
public class RagApiConfig {

    @Bean
    public RagProperties ragProperties() {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        String ragHost = dotenv.get("RAG_HOST", System.getenv("RAG_HOST"));
        String ragApiKey = dotenv.get("RAG_X_API_KEY", System.getenv("RAG_X_API_KEY"));
        String ragClientId = dotenv.get("RAG_X_CLIENT_ID", System.getenv("RAG_X_CLIENT_ID"));
        String anthropicApiKey = dotenv.get("ANTHROPIC_API_KEY", System.getenv("ANTHROPIC_API_KEY"));

        try {
            return new RagProperties(ragHost, ragApiKey, ragClientId, anthropicApiKey);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("필수 RAG 서비스 환경변수가 설정되지 않았습니다: " + e.getMessage());
        }
    }
}
