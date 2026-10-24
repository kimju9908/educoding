package com.kh.totalproject.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.totalproject.constant.ChatRole;
import com.kh.totalproject.constant.rag.RagApiPath;
import com.kh.totalproject.constant.rag.RagProperties;
import com.kh.totalproject.dto.request.AskChatbotRequest;
import com.kh.totalproject.dto.request.ChatTurn;
import com.kh.totalproject.dto.request.CitedSource;
import com.kh.totalproject.dto.request.RagAskRequest;
import com.kh.totalproject.dto.response.ChatbotAnswerResponse;
import com.kh.totalproject.dto.response.ChatbotSourceResponse;
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
import java.util.stream.IntStream;

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
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChatbotAnswerResponse ask(AskChatbotRequest request) {
        String sessionId = normalizeSessionId(request.sessionId());

        List<ChatTurn> history = sessionId == null
                ? Collections.emptyList()
                : loadHistory(sessionId);

        RagAskRequest ragRequest = new RagAskRequest(request.question(), request.language(), history);
        ChatbotAnswerResponse response = callRagService(ragRequest);

        if (sessionId != null) {
            saveTurn(sessionId, ChatRole.USER, request.question(), List.of());
            saveTurn(sessionId, ChatRole.ASSISTANT, response.answer(), citedSourcesFrom(response.sources()));
        }

        return response;
    }

    // RAG 서비스가 보낸 sources는 이미 인용 순서대로 와 있으므로(agent_graph.py의
    // ordered_hits_from_cited), 배열 안 위치(1부터)가 바로 그 답변 본문에서 쓰인 [n] 번호다.
    private List<CitedSource> citedSourcesFrom(List<ChatbotSourceResponse> sources) {
        return IntStream.range(0, sources.size())
                .mapToObj(i -> new CitedSource(i + 1, sources.get(i).chunkId()))
                .toList();
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
                .map(m -> new ChatTurn(m.getRole().name().toLowerCase(), m.getContent(), parseSources(m.getSourcesJson())))
                .toList();
    }

    // sourcesJson이 없는 행(USER 메시지, 또는 이 컬럼이 생기기 전에 저장된 ASSISTANT 메시지)이나
    // 파싱이 깨진 행은 "출처 정보 없음"으로 조용히 처리한다 -- 없는 정보를 추측해서 채우지 않음.
    private List<CitedSource> parseSources(String sourcesJson) {
        if (sourcesJson == null || sourcesJson.isBlank()) {
            return List.of();
        }
        try {
            return List.of(objectMapper.readValue(sourcesJson, CitedSource[].class));
        }
        catch (JsonProcessingException e) {
            log.warn("Failed to parse stored sourcesJson, treating as no sources: {}", e.getMessage());
            return List.of();
        }
    }

    private void saveTurn(String sessionId, ChatRole role, String content, List<CitedSource> sources) {
        chatMessageRepository.save(ChatMessage.builder()
                .sessionId(sessionId)
                .role(role)
                .content(content)
                .sourcesJson(sources.isEmpty() ? null : writeSourcesJson(sources))
                .build());
    }

    private String writeSourcesJson(List<CitedSource> sources) {
        try {
            return objectMapper.writeValueAsString(sources);
        }
        catch (JsonProcessingException e) {
            // Serializing a list of two primitive-ish fields should never actually fail;
            // if it somehow does, the turn is still saved (just without sources) rather
            // than losing the whole message.
            log.warn("Failed to serialize sources, saving turn without them: {}", e.getMessage());
            return null;
        }
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
