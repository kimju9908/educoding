package com.kh.totalproject.controller;

import com.kh.totalproject.dto.request.AskChatbotRequest;
import com.kh.totalproject.dto.response.ChatbotAnswerResponse;
import com.kh.totalproject.dto.response.ErrorResponse;
import com.kh.totalproject.service.RagChatbotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/************************************
 * - 학습 자료 기반 RAG 챗봇 질의 응답
 ***********************************/
@RestController
@RequestMapping("/api/chatbot")
@Slf4j
@RequiredArgsConstructor
public class RagChatbotController {
    private final RagChatbotService ragChatbotService;

    @PostMapping("/ask")
    public ResponseEntity<?> ask(@RequestBody AskChatbotRequest request) {
        if (request.question() == null || request.question().isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("질문을 입력해주세요"));
        }

        ChatbotAnswerResponse response = ragChatbotService.ask(request);
        return ResponseEntity.ok(response);
    }
}
