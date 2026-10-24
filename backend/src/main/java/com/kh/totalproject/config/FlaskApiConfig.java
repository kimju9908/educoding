package com.kh.totalproject.config;

import com.kh.totalproject.constant.webhook.FlaskProperties;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Flask API 연결에 필요한 구성 정보를 제공하는 Spring Configuration 클래스입니다.
 * 환경 변수에서 필요한 설정 값을 로드하여 FlaskProperties 불변 객체로 캡슐화합니다.
 */
@Configuration
public class FlaskApiConfig {

    /**
     * 환경 변수에서 Flask API 연결 정보를 로드하여 FlaskProperties 빈을 생성합니다.
     *
     * @return Flask API 연결에 필요한 구성 정보를 담은 FlaskProperties 객체
     * @throws RuntimeException 필수 환경 변수가 설정되지 않은 경우
     */
    @Bean
    public FlaskProperties flaskProperties() {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        String flaskUrl = dotenv.get("FLASK_HOST", System.getenv("FLASK_HOST"));
        String flaskXApiKey = dotenv.get("FLASK_X_API_KEY", System.getenv("FLASK_X_API_KEY"));
        String flaskXClientId = dotenv.get("FLASK_X_CLIENT_ID", System.getenv("FLASK_X_CLIENT_ID"));

        try {
            return new FlaskProperties(flaskUrl, flaskXApiKey, flaskXClientId);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("필수 Flask API 환경변수가 설정되지 않았습니다: " + e.getMessage());
        }
    }
}