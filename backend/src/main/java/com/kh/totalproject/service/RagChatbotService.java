package com.kh.totalproject.service;

import com.kh.totalproject.constant.rag.RagApiPath;
import com.kh.totalproject.constant.rag.RagProperties;
import com.kh.totalproject.dto.request.AskChatbotRequest;
import com.kh.totalproject.dto.response.ChatbotAnswerResponse;
import com.kh.totalproject.exception.CustomHttpClientErrorException;
import com.kh.totalproject.exception.CustomHttpMessageNotReadableException;
import com.kh.totalproject.exception.CustomHttpServerErrorException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

/**
 * RAG 챗봇 서비스(Python/FastAPI)에 질문을 전달하고 답변을 받아오는 서비스입니다.
 * CodeChallengeJudgeJobService가 judge(Flask)와 통신하는 방식을 그대로 따릅니다.
 */
@RequiredArgsConstructor
@Service
@Slf4j
public class RagChatbotService {
    private final RestTemplate restTemplate;
    private final RagProperties ragProperties;

    public ChatbotAnswerResponse ask(AskChatbotRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        if (ragProperties.apiKey() != null && !ragProperties.apiKey().isEmpty()) {
            headers.set("X-Api-Key", ragProperties.apiKey());
            headers.set("X-Client-Id", ragProperties.clientId());
        }
        if (ragProperties.anthropicApiKey() != null && !ragProperties.anthropicApiKey().isEmpty()) {
            headers.set("X-Anthropic-Api-Key", ragProperties.anthropicApiKey());
        }

        HttpEntity<AskChatbotRequest> requestEntity = new HttpEntity<>(request, headers);
        String requestUrl = ragProperties.host() + RagApiPath.ASK;

        try {
            ResponseEntity<ChatbotAnswerResponse> ragResponse = restTemplate.exchange(
                    requestUrl, HttpMethod.POST, requestEntity, ChatbotAnswerResponse.class
            );
            return ragResponse.getBody();
        }
        catch (HttpMessageNotReadableException e) {
            log.error("Failed to parse response from RAG service: {}", e.getMessage());
            throw new CustomHttpMessageNotReadableException(e, requestUrl);
        }
        catch (HttpClientErrorException e) {
            log.error("Client error({}) from RAG service: {}", e.getStatusCode(), requestUrl);
            throw new CustomHttpClientErrorException(e, requestUrl);
        }
        catch (HttpServerErrorException e) {
            log.error("Server error({}) from RAG service: {}", e.getStatusCode(), requestUrl);
            throw new CustomHttpServerErrorException(e, requestUrl);
        }
    }
}
