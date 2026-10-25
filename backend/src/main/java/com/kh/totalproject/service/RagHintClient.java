package com.kh.totalproject.service;

import com.kh.totalproject.constant.rag.RagApiPath;
import com.kh.totalproject.constant.rag.RagProperties;
import com.kh.totalproject.dto.request.RagHintRequest;
import com.kh.totalproject.dto.response.CodeHintContent;
import com.kh.totalproject.exception.CodeReviewGenerationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * RAG 서비스(Python/FastAPI)의 /hint/generate 호출. RagReviewClient와 같은 방식(전용 타임아웃, 같은 인증 헤더).
 * 읽기 타임아웃은 RAG 쪽 시간 예산(RAG_HINT_TIME_BUDGET_SECONDS 60초 + Claude 호출 1회 최대 45초)보다 길게 잡는다.
 * 실패는 CodeReviewGenerationException(사용자에게 보여줄 수 있는 문장)으로 통일한다.
 */
@Component
@Slf4j
public class RagHintClient {
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(5);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(150);

    private final RagProperties ragProperties;
    private final RestTemplate restTemplate;

    public RagHintClient(RagProperties ragProperties) {
        this.ragProperties = ragProperties;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(CONNECT_TIMEOUT);
        factory.setReadTimeout(READ_TIMEOUT);
        this.restTemplate = new RestTemplate(factory);
    }

    public CodeHintContent generate(RagHintRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        if (ragProperties.apiKey() != null && !ragProperties.apiKey().isEmpty()) {
            headers.set("X-Api-Key", ragProperties.apiKey());
            headers.set("X-Client-Id", ragProperties.clientId());
        }
        if (ragProperties.anthropicApiKey() != null && !ragProperties.anthropicApiKey().isEmpty()) {
            headers.set("X-Anthropic-Api-Key", ragProperties.anthropicApiKey());
        }

        String requestUrl = ragProperties.host() + RagApiPath.HINT;
        try {
            CodeHintContent body = restTemplate.exchange(
                    requestUrl, HttpMethod.POST, new HttpEntity<>(request, headers), CodeHintContent.class
            ).getBody();
            if (body == null) {
                throw new CodeReviewGenerationException("AI 응답이 비어 있습니다. 다시 시도해주세요.");
            }
            return body;
        }
        catch (HttpStatusCodeException e) {
            log.error("Error({}) from RAG hint service: {} {}", e.getStatusCode(), requestUrl, e.getResponseBodyAsString());
            throw new CodeReviewGenerationException(messageFor(e));
        }
        catch (ResourceAccessException e) {
            log.error("RAG hint service unreachable or timed out: {} ({})", requestUrl, e.getMessage());
            throw new CodeReviewGenerationException("AI 힌트 서비스 응답이 지연되거나 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
        }
        catch (RestClientException e) {
            log.error("Invalid response from RAG hint service: {} ({})", requestUrl, e.getMessage());
            throw new CodeReviewGenerationException("AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.");
        }
    }

    private String messageFor(HttpStatusCodeException e) {
        int status = e.getStatusCode().value();
        if (status == 504) {
            return "AI 응답이 지연되었습니다. 잠시 후 다시 시도해주세요.";
        }
        if (status == 503) {
            return "AI 힌트 기능이 설정되지 않았습니다. 관리자에게 문의해주세요.";
        }
        if (status == 502 && e.getResponseBodyAsString().contains("format error")) {
            return "AI가 공개 범위에 맞는 힌트를 만들지 못했습니다. 다시 시도해주세요.";
        }
        return "AI 힌트를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.";
    }
}
