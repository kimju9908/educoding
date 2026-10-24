package com.kh.totalproject.controller;

import com.kh.totalproject.dto.response.JudgmentStatisticsResponse;
import com.kh.totalproject.service.CodeChallengeJudgmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import static com.kh.totalproject.util.SecurityUtil.getCurrentUserIdOrThrow;

@RestController
@RequestMapping("/api/judgment")
@Slf4j
@RequiredArgsConstructor
public class JudgmentController {
    private final CodeChallengeJudgmentService judgmentService;

    @GetMapping("/statistic")
    public ResponseEntity<JudgmentStatisticsResponse> getJudgmentStatistics() {
        JudgmentStatisticsResponse response = judgmentService.getJudgmentStatistics(getCurrentUserIdOrThrow());
        return ResponseEntity.ok(response);
    }
}
