package com.kh.totalproject.service;

import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeDifficulty;
import com.kh.totalproject.dto.response.*;
import com.kh.totalproject.entity.CodeChallenge;
import com.kh.totalproject.repository.CodeChallengeJudgmentRepository;
import com.kh.totalproject.repository.CodeChallengeRepository;
import jakarta.annotation.Nullable;
import jakarta.persistence.Tuple;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.kh.totalproject.dto.response.ChallengeSummariesResponse.ChallengeSummary;
import java.util.*;

@Transactional
@RequiredArgsConstructor
@Service
@Slf4j
public class CodeChallengeService {
    private final CodeChallengeJudgmentRepository codeChallengeJudgmentRepository;
    private final CodeChallengeRepository codeChallengeRepository;

    public ChallengeDetailResponse getCodeChallengeDetail(Long challengeId, Long userKey) {
        CodeChallenge codeChallenge = codeChallengeRepository.findById(challengeId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 코딩 테스트 문제입니다"));
        String lastSubmittedCode = codeChallengeJudgmentRepository.findCodeByCodeChallengeIdAndUserKeyOrderBySubmittedAtDesc(challengeId, userKey).orElse(null);
        return new ChallengeDetailResponse(
                codeChallenge.getTitle(),
                codeChallenge.getDescription(),
                codeChallenge.getCond(),
                codeChallenge.getDifficulty(),
                codeChallenge.getMemoryLimitMb(),
                codeChallenge.getTimeLimitMs(),
                lastSubmittedCode
        );
    }

    public ChallengeSummariesResponse getCodeChallengeSummariesByDifficulty(
            CodeChallengeDifficulty difficulty,
            @Nullable Long userKey
    ) {
        // 1. 난이도별 모든 챌린지 조회
        List<CodeChallenge> challenges = codeChallengeRepository.findByDifficulty(difficulty);
        if (challenges.isEmpty()) {
            return new ChallengeSummariesResponse(Collections.emptyList());
        }

        // 2. 챌린지 ID 리스트 생성
        List<Long> challengeIds = challenges.stream()
                .map(CodeChallenge::getChallengeId)
                .toList();

        // 3. 챌린지별 전체 유저의 챌린지 통과 비율 조회
        Map<Long, Float> passingRateByChallengeId = this.getChallengePassingRate(challengeIds);

        // 4. 챌린지별 사용자별 성공 여부 조회
        // - 로그인 상태이고 채점 내역이 있다면 { key: challengeId, value: true/false }
        // - 로그아웃 상태이거나 채점 내역이 없다면 { key: challengeId, value: null }
        Map<Long, Boolean> userPassStatusByChallengeId = this.getUserChallengePassStatus(challengeIds, userKey);

        // 5. 챌린지별 목차정보 리스트 생성
        List<ChallengeSummary> challengeSummaryList = new ArrayList<>();
        for (var challenge : challenges) {
            Long challengeId = challenge.getChallengeId();
            float passingRate = passingRateByChallengeId.getOrDefault(challengeId, 0.0f);
            Boolean isUserPassedBefore = (userKey != null) ? userPassStatusByChallengeId.getOrDefault(challengeId, false) : null;

            challengeSummaryList.add(
                    new ChallengeSummary(
                            challengeId,
                            challenge.getTitle(),
                            challenge.getCategory(),
                            challenge.getDifficulty(),
                            passingRate,
                            isUserPassedBefore
                    )
            );
        }

        return new ChallengeSummariesResponse(challengeSummaryList);
    }

    private Map<Long, Float> getChallengePassingRate(List<Long> challengeIds) {
        Map<Long, Float> passingRateByChallengeId = new HashMap<>();

        // 문제에 대한 전체 유저의 채점 기록이 없는 경우 기본 값
        for (Long challengeId : challengeIds) {
            passingRateByChallengeId.put(challengeId, 0.0f);
        }

        List<Tuple> judgmentStats = codeChallengeJudgmentRepository.countStatsByCodeChallengeIds(challengeIds);
        for (Tuple stat : judgmentStats) {
            Long challengeId = stat.get("challengeId", Long.class);
            Long totalJudgmentCount = stat.get("totalJudgmentCount", Long.class);
            Long passedJudgmentCount = stat.get("passedJudgmentCount", Long.class);
            passingRateByChallengeId.put(challengeId, calculatePassingRate(totalJudgmentCount.intValue(), passedJudgmentCount.intValue()));
        }
        return passingRateByChallengeId;
    }

    private Map<Long, Boolean> getUserChallengePassStatus(List<Long> challengeIds, Long userKey) {
        Map<Long, Boolean> userPassStatusByChallengeId = new HashMap<>();

        // 로그아웃 상태이거나 해당 유저에 대한 채점 내역이 없다면 기본 값
        for (Long challengeId : challengeIds) {
            userPassStatusByChallengeId.put(challengeId, null);
        }

        if (userKey != null) {
            List<Tuple> userJudgmentStats = codeChallengeJudgmentRepository.countUserPassesByCodeChallengeIdsAndUserKey(challengeIds, userKey);
            for (Tuple stat : userJudgmentStats) {
                Long challengeId = stat.get("challengeId", Long.class);
                Long passedJudgmentCount = stat.get("passedJudgmentCount", Long.class);
                userPassStatusByChallengeId.put(challengeId, passedJudgmentCount > 0);
            }
        }
        return userPassStatusByChallengeId;
    }

    private float calculatePassingRate(int totalJudgmentCount, int passedJudgmentCount) {
        return totalJudgmentCount == 0 ? 0.0f :
                Math.round((passedJudgmentCount / (float) totalJudgmentCount) * 1000) / 10.0f;
    }
}
