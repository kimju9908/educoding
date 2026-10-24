package com.kh.totalproject.dto.response;

import java.util.List;

public record ChatbotAnswerResponse(
    String answer,
    List<ChatbotSourceResponse> sources
) {}
