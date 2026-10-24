package com.kh.totalproject.controller;

import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeDifficulty;
import com.kh.totalproject.dto.response.ChallengeDetailResponse;
import com.kh.totalproject.dto.response.ChallengeSummariesResponse;
import com.kh.totalproject.service.CodeChallengeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.kh.totalproject.util.SecurityUtil.getCurrentUserKeyIfPresent;

@RestController
@RequestMapping("/api/code-challenge")
@Slf4j
@RequiredArgsConstructor
public class CodeChallengeController {
    private final CodeChallengeService codeChallengeService;

    @GetMapping("/{challengeId}")
    public ResponseEntity<ChallengeDetailResponse> getChallengeDetail(
        @PathVariable("challengeId") Long challengeId
    ) {
        ChallengeDetailResponse challengeDetailResponse = codeChallengeService.getCodeChallengeDetail(challengeId, getCurrentUserKeyIfPresent());
        return ResponseEntity.ok(challengeDetailResponse);
    }

    @GetMapping
    public ResponseEntity<ChallengeSummariesResponse> getChallengeSummaries(
        @RequestParam(required = false) CodeChallengeDifficulty difficulty
    ) {
        ChallengeSummariesResponse challengeSummariesResponse = codeChallengeService.getCodeChallengeSummariesByDifficulty(difficulty, getCurrentUserKeyIfPresent());
        return ResponseEntity.ok(challengeSummariesResponse);
    }
}
