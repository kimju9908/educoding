package com.kh.totalproject.service;

import com.kh.totalproject.constant.rag.RagApiPath;
import com.kh.totalproject.constant.rag.RagProperties;
import com.kh.totalproject.dto.request.RagReviewRequest;
import com.kh.totalproject.dto.response.CodeReviewContent;
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
 * RAG 서비스(Python/FastAPI)의 /review/generate 호출.
 * 공용 RestTemplate 빈은 타임아웃이 없어서(RestTemplateConfig), 리뷰 생성(최대 수십 초~2분)만을 위한
 * 타임아웃이 있는 RestTemplate을 따로 만든다 -- 다른 서비스 호출 동작은 건드리지 않기 위함.
 * 읽기 타임아웃은 RAG 쪽 시간 예산(RAG_REVIEW_TIME_BUDGET_SECONDS 90초 + Claude 호출 1회 최대 60초)보다 길게 잡는다.
 * 헤더 구성은 RagChatbotService와 동일하다 (서비스 인증 키와 Claude 키는 헤더로만 전달, 본문·모델 메시지에는 없음).
 */
@Component
@Slf4j
public class RagReviewClient {
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(5);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(180);

    private final RagProperties ragProperties;
    private final RestTemplate restTemplate;

    public RagReviewClient(RagProperties ragProperties) {
        this.ragProperties = ragProperties;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(CONNECT_TIMEOUT);
        factory.setReadTimeout(READ_TIMEOUT);
        this.restTemplate = new RestTemplate(factory);
    }

    public CodeReviewContent generate(RagReviewRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        if (ragProperties.apiKey() != null && !ragProperties.apiKey().isEmpty()) {
            headers.set("X-Api-Key", ragProperties.apiKey());
            headers.set("X-Client-Id", ragProperties.clientId());
        }
        if (ragProperties.anthropicApiKey() != null && !ragProperties.anthropicApiKey().isEmpty()) {
            headers.set("X-Anthropic-Api-Key", ragProperties.anthropicApiKey());
        }

        String requestUrl = ragProperties.host() + RagApiPath.REVIEW;
        try {
            CodeReviewContent body = restTemplate.exchange(
                    requestUrl, HttpMethod.POST, new HttpEntity<>(request, headers), CodeReviewContent.class
            ).getBody();
            if (body == null) {
                throw new CodeReviewGenerationException("AI 응답이 비어 있습니다. 다시 시도해주세요.");
            }
            return body;
        }
        catch (HttpStatusCodeException e) {
            log.error("Error({}) from RAG review service: {} {}", e.getStatusCode(), requestUrl, e.getResponseBodyAsString());
            throw new CodeReviewGenerationException(messageFor(e));
        }
        catch (ResourceAccessException e) {
            log.error("RAG review service unreachable or timed out: {} ({})", requestUrl, e.getMessage());
            throw new CodeReviewGenerationException("AI 리뷰 서비스 응답이 지연되거나 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
        }
        catch (RestClientException e) {
            // 응답 본문 역직렬화 실패 등
            log.error("Invalid response from RAG review service: {} ({})", requestUrl, e.getMessage());
            throw new CodeReviewGenerationException("AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.");
        }
    }

    private String messageFor(HttpStatusCodeException e) {
        int status = e.getStatusCode().value();
        if (status == 504) {
            return "AI 응답이 지연되었습니다. 잠시 후 다시 시도해주세요.";
        }
        if (status == 503) {
            return "AI 리뷰 기능이 설정되지 않았습니다. 관리자에게 문의해주세요.";
        }
        if (status == 502 && e.getResponseBodyAsString().contains("format error")) {
            return "AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.";
        }
        return "AI 코드 리뷰를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.";
    }
}
