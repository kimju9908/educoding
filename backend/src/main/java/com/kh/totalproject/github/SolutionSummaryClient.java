package com.kh.totalproject.github;

import com.kh.totalproject.constant.rag.RagApiPath;
import com.kh.totalproject.constant.rag.RagProperties;
import com.kh.totalproject.dto.request.RagSolutionSummaryRequest;
import com.kh.totalproject.dto.response.SolutionSummaryContent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/** Calls rag/service's /solution-summary/generate. Mirrors RagReviewClient's auth
 * header style exactly. AutoCommitJobRunner tries this at most ONCE per job
 * attempt and treats any exception here (including a plain timeout) the same way
 * -- fall back to a fixed default description, never block the commit on it
 * (docs/github-auto-commit.md section 5). */
@Component
@Slf4j
public class SolutionSummaryClient {
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(5);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(60);

    private final RagProperties ragProperties;
    private final RestTemplate restTemplate;

    public SolutionSummaryClient(RagProperties ragProperties) {
        this.ragProperties = ragProperties;
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(CONNECT_TIMEOUT);
        factory.setReadTimeout(READ_TIMEOUT);
        this.restTemplate = new RestTemplate(factory);
    }

    public SolutionSummaryContent generate(RagSolutionSummaryRequest request) {
        if (ragProperties.anthropicApiKey() == null || ragProperties.anthropicApiKey().isBlank()) {
            throw new IllegalStateException("AI 요약 기능이 설정되지 않았습니다.");
        }
        var headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        if (ragProperties.apiKey() != null && !ragProperties.apiKey().isEmpty()) {
            headers.set("X-Api-Key", ragProperties.apiKey());
            headers.set("X-Client-Id", ragProperties.clientId());
        }
        headers.set("X-Anthropic-Api-Key", ragProperties.anthropicApiKey());

        String requestUrl = ragProperties.host() + RagApiPath.SOLUTION_SUMMARY;
        try {
            SolutionSummaryContent body = restTemplate.exchange(
                    requestUrl, HttpMethod.POST, new HttpEntity<>(request, headers), SolutionSummaryContent.class
            ).getBody();
            if (body == null) throw new IllegalStateException("AI 요약 응답이 비어 있습니다.");
            return body;
        } catch (RestClientException e) {
            log.warn("Solution summary generation failed, falling back to default description: {}", e.getMessage());
            throw new IllegalStateException("AI 풀이 요약을 생성하지 못했습니다.", e);
        }
    }
}
