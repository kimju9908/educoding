package com.kh.totalproject.service;

import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeDifficulty;
import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeLanguage;
import com.kh.totalproject.dto.callbackevent.JudgeJobResult;
import com.kh.totalproject.dto.callbackevent.JudgeJobResultPassed;
import com.kh.totalproject.dto.callbackevent.JudgeJobResultUnpassed;
import com.kh.totalproject.dto.response.JudgmentStatisticsResponse;
import com.kh.totalproject.entity.CodeChallenge;
import com.kh.totalproject.entity.CodeChallengeJudgment;
import com.kh.totalproject.entity.User;
import com.kh.totalproject.repository.CodeChallengeJudgmentRepository;
import com.kh.totalproject.repository.CodeChallengeRepository;
import com.kh.totalproject.repository.UserRepository;
import jakarta.persistence.Tuple;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import static com.kh.totalproject.dto.response.JudgmentStatisticsResponse.JudgmentStatistic;

@RequiredArgsConstructor
@Service
@Slf4j
@Transactional
public class CodeChallengeJudgmentService {
    private final UserRepository userRepository;
    private final CodeChallengeRepository codeChallengeRepository;
    private final CodeChallengeJudgmentRepository codeChallengeJudgmentRepository;

    public void saveJudgmentHistory(JudgeJobResult judgmentJobResult) {
        User user = userRepository.findById(judgmentJobResult.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다"));
        CodeChallenge challenge = codeChallengeRepository.findById(judgmentJobResult.getChallengeId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 코딩 테스트 문제입니다"));

        // 공통 judgment 필드 삽입
        CodeChallengeJudgment.CodeChallengeJudgmentBuilder builder = CodeChallengeJudgment.builder()
                .user(user)
                .codeChallenge(challenge)
                .codeLanguage(judgmentJobResult.getCodeLanguage())
                .code(judgmentJobResult.getCode())
                .codeByteSize(judgmentJobResult.getCodeByteSize())
                .submittedAt(judgmentJobResult.getSubmittedAt());

        // 통과한 경우
        if (judgmentJobResult instanceof JudgeJobResultPassed passed) {
            builder
                    .passed(true)
                    .maxMemoryUsageMb(passed.getMaxMemoryUsageMb())
                    .maxElapsedTimeMs(passed.getMaxElapsedTimeMs());
            // 통과하지 못한 경우
        } else if (judgmentJobResult instanceof JudgeJobResultUnpassed unpassed) {
            builder
                    .passed(false)
                    .failureCause(unpassed.getFailureCause())
                    .failureDetail(unpassed.getFailureDetail());
        }

        CodeChallengeJudgment judgment = builder.build();
        codeChallengeJudgmentRepository.save(judgment);
    }

    public JudgmentStatisticsResponse getJudgmentStatistics(Long userKey) {
        // 난이도와 언어별 통계 결과 맵 초기화
        Map<CodeChallengeDifficulty, Map<CodeChallengeLanguage, JudgmentStatistic>> statisticsMap = new HashMap<>();

        // 챌린지 난이도와 프로그래밍 언어의 집합 설정 (Enum 사용)
        Set<CodeChallengeDifficulty> difficulties = new HashSet<>(Arrays.asList(CodeChallengeDifficulty.values()));
        Set<CodeChallengeLanguage> languages = new HashSet<>(Arrays.asList(CodeChallengeLanguage.values()));

        // 난이도 및 프로그래밍 언어별 모든 통계 조합 초기값 설정
        difficulties.forEach(difficulty -> {
            Map<CodeChallengeLanguage, JudgmentStatistic> languageMap = new HashMap<>();
            statisticsMap.put(difficulty, languageMap);

            languages.forEach(language -> {
                languageMap.put(language, new JudgmentStatistic(0, 0, 0, 0, 0, 0, 0, 0));
            });
        });

        // 유저의 전체 채점 이력을 난이도와 언어별로 그룹화하여 통과횟수/실패횟수/전체채점수/미통과사유별실패횟수 통계 조회
        List<Tuple> allStats = codeChallengeJudgmentRepository.findJudgmentStatsByDifficultyAndLanguage(userKey);

        // 실제 조회 결과를 바탕으로 얻은 통계 데이터로 치환
        // 아예 존재하지 않는 난이도-언어 조합은 튜플에 포함되지 않음
        for (Tuple stat : allStats) {
            CodeChallengeDifficulty difficulty = stat.get("difficulty", CodeChallengeDifficulty.class);
            CodeChallengeLanguage language = stat.get("language", CodeChallengeLanguage.class);

            int passedCount = ((Number) stat.get("passedCount")).intValue();
            int failedCount = ((Number) stat.get("failedCount")).intValue();
            int totalCount = ((Number) stat.get("totalCount")).intValue();
            int compileErrorCount = ((Number) stat.get("compileErrorCount")).intValue();
            int runtimeErrorCount = ((Number) stat.get("runtimeErrorCount")).intValue();
            int wrongAnswerCount = ((Number) stat.get("wrongAnswerCount")).intValue();
            int outOfMemoryCount = ((Number) stat.get("outOfMemoryCount")).intValue();
            int timeoutCount = ((Number) stat.get("timeoutCount")).intValue();

            JudgmentStatistic statistic = new JudgmentStatistic(
                passedCount,
                failedCount,
                totalCount,
                compileErrorCount,
                runtimeErrorCount,
                wrongAnswerCount,
                outOfMemoryCount,
                timeoutCount
            );

            statisticsMap.get(difficulty).put(language, statistic);
        }

        return new JudgmentStatisticsResponse(statisticsMap);
    }
}

