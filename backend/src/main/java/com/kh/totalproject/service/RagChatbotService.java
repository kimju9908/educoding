package com.kh.totalproject.service;

import com.kh.totalproject.constant.ChatRole;
import com.kh.totalproject.constant.rag.RagApiPath;
import com.kh.totalproject.constant.rag.RagProperties;
import com.kh.totalproject.dto.request.AskChatbotRequest;
import com.kh.totalproject.dto.request.ChatTurn;
import com.kh.totalproject.dto.request.RagAskRequest;
import com.kh.totalproject.dto.response.ChatbotAnswerResponse;
import com.kh.totalproject.entity.ChatMessage;
import com.kh.totalproject.exception.CustomHttpClientErrorException;
import com.kh.totalproject.exception.CustomHttpMessageNotReadableException;
import com.kh.totalproject.exception.CustomHttpServerErrorException;
import com.kh.totalproject.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

/**
 * RAG 챗봇 서비스(Python/FastAPI)에 질문을 전달하고 답변을 받아오는 서비스입니다.
 * CodeChallengeJudgeJobService가 judge(Flask)와 통신하는 방식을 그대로 따릅니다.
 *
 * sessionId가 오면(AskChatbotRequest.sessionId) 대화 상태(ChatMessage)를 읽어 RAG 서비스에
 * history로 같이 보내고, 답변을 받으면 이번 턴(질문+답변)을 저장해 멀티턴 대화를 이어갑니다.
 * sessionId가 없으면 기존처럼 매 질문이 독립적으로 처리됩니다 (하위 호환).
 */
@RequiredArgsConstructor
@Service
@Slf4j
public class RagChatbotService {
    // Claude에 보낼 대화창을 너무 길게 하지 않기 위한 히스토리 보관 턴 수 (질문+답변 쌍 기준 3턴)
    private static final int HISTORY_TURN_LIMIT = 6;
    // 비로그인 사용자도 쓸 수 있는 공개 엔드포인트라 sessionId를 검증 없이 그대로 신뢰할 수 없음 --
    // 터무니없이 긴 값은 히스토리 조회/저장 없이 무시(=이번 턴만 단발 질문으로 처리)
    private static final int MAX_SESSION_ID_LENGTH = 100;

    private final RestTemplate restTemplate;
    private final RagProperties ragProperties;
    private final ChatMessageRepository chatMessageRepository;

    public ChatbotAnswerResponse ask(AskChatbotRequest request) {
        String sessionId = normalizeSessionId(request.sessionId());

        List<ChatTurn> history = sessionId == null
                ? Collections.emptyList()
                : loadHistory(sessionId);

        RagAskRequest ragRequest = new RagAskRequest(request.question(), request.language(), history);
        ChatbotAnswerResponse response = callRagService(ragRequest);

        if (sessionId != null) {
            saveTurn(sessionId, ChatRole.USER, request.question());
            saveTurn(sessionId, ChatRole.ASSISTANT, response.answer());
        }

        return response;
    }

    private String normalizeSessionId(String sessionId) {
        if (sessionId == null || sessionId.isBlank() || sessionId.length() > MAX_SESSION_ID_LENGTH) {
            return null;
        }
        return sessionId;
    }

    private List<ChatTurn> loadHistory(String sessionId) {
        List<ChatMessage> recent = chatMessageRepository.findBySessionIdOrderByIdDesc(
                sessionId, PageRequest.of(0, HISTORY_TURN_LIMIT)
        );
        Collections.reverse(recent); // 최신순으로 가져왔으니 시간순으로 되돌림
        return recent.stream()
                .map(m -> new ChatTurn(m.getRole().name().toLowerCase(), m.getContent()))
                .toList();
    }

    private void saveTurn(String sessionId, ChatRole role, String content) {
        chatMessageRepository.save(ChatMessage.builder()
                .sessionId(sessionId)
                .role(role)
                .content(content)
                .build());
    }

    private ChatbotAnswerResponse callRagService(RagAskRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        if (ragProperties.apiKey() != null && !ragProperties.apiKey().isEmpty()) {
            headers.set("X-Api-Key", ragProperties.apiKey());
            headers.set("X-Client-Id", ragProperties.clientId());
        }
        if (ragProperties.anthropicApiKey() != null && !ragProperties.anthropicApiKey().isEmpty()) {
            headers.set("X-Anthropic-Api-Key", ragProperties.anthropicApiKey());
        }

        HttpEntity<RagAskRequest> requestEntity = new HttpEntity<>(request, headers);
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
