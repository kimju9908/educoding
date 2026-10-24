package com.kh.totalproject.repository;

import com.kh.totalproject.entity.CodeChallengeJudgment;
import jakarta.persistence.Tuple;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodeChallengeJudgmentRepository extends JpaRepository<CodeChallengeJudgment, Long> {
    // 마지막 채점에 대해 유저가 제출한 code 반환
    @Query("SELECT j.code " +
            "FROM CodeChallengeJudgment j " +
            "WHERE j.codeChallenge.challengeId = :challengeId " +
            "AND j.user.userKey = :userKey " +
            "ORDER BY j.submittedAt DESC " +
            "LIMIT 1")
    Optional<String> findCodeByCodeChallengeIdAndUserKeyOrderBySubmittedAtDesc(
            @Param("challengeId") Long challengeId,
            @Param("userKey") Long userKey
    );

    // 챌린지ID 리스트에 대해 전체 유저의 채점 패스 횟수와 총 제출 횟수 조회
    // 최적화를 위해 벌크로 조회
    @Query("SELECT j.codeChallenge.challengeId as challengeId, " +
            "COUNT(j) as totalJudgmentCount, " +
            "SUM(CASE WHEN j.passed = true THEN 1 ELSE 0 END) as passedJudgmentCount " +
            "FROM CodeChallengeJudgment j " +
            "WHERE j.codeChallenge.challengeId IN :challengeIds " +
            "GROUP BY j.codeChallenge.challengeId")
    List<Tuple> countStatsByCodeChallengeIds(@Param("challengeIds") List<Long> challengeIds);

    // 챌린지ID 마다 대해 특정 유저의 채점 통과 여부 조회
    // 최적화를 위해 벌크로 조회
    @Query("SELECT j.codeChallenge.challengeId as challengeId, " +
            "SUM(CASE WHEN j.passed = true THEN 1 ELSE 0 END) as passedJudgmentCount " +
            "FROM CodeChallengeJudgment j " +
            "WHERE j.codeChallenge.challengeId IN :challengeIds " +
            "AND j.user.userKey = :userKey " +
            "GROUP BY j.codeChallenge.challengeId")
    List<Tuple> countUserPassesByCodeChallengeIdsAndUserKey(@Param("challengeIds") List<Long> challengeIds,
                                                              @Param("userKey") Long userKey);

    // 유저의 전체 채점 이력을 난이도와 언어별로 그룹화하여 통과횟수/실패횟수/전체채점수/미통과사유별실패횟수 통계 조회
    @Query("SELECT " +
            "j.codeChallenge.difficulty AS difficulty, " +
            "j.codeLanguage AS language, " +
            "SUM(CASE WHEN j.passed = true THEN 1 ELSE 0 END) AS passedCount, " +
            "SUM(CASE WHEN j.passed = false THEN 1 ELSE 0 END) AS failedCount, " +
            "COUNT(j) AS totalCount, " +
            "SUM(CASE WHEN j.passed = false AND j.failureCause = 'COMPILE_ERROR' THEN 1 ELSE 0 END) AS compileErrorCount, " +
            "SUM(CASE WHEN j.passed = false AND j.failureCause = 'RUNTIME_ERROR' THEN 1 ELSE 0 END) AS runtimeErrorCount, " +
            "SUM(CASE WHEN j.passed = false AND j.failureCause = 'WRONG_ANSWER' THEN 1 ELSE 0 END) AS wrongAnswerCount, " +
            "SUM(CASE WHEN j.passed = false AND (j.failureCause = 'COMPILE_OUT_OF_MEMORY' OR j.failureCause = 'RUNTIME_OUT_OF_MEMORY' OR j.failureCause = 'SANDBOX_OUT_OF_MEMORY') THEN 1 ELSE 0 END) AS outOfMemoryCount, " +
            "SUM(CASE WHEN j.passed = false AND (j.failureCause = 'COMPILE_TIMEOUT' OR j.failureCause = 'RUNTIME_TIMEOUT' OR j.failureCause = 'SANDBOX_TIMEOUT') THEN 1 ELSE 0 END) AS timeoutCount " +
            "FROM CodeChallengeJudgment j " +
            "WHERE j.user.userKey = :userKey " +
            "GROUP BY j.codeChallenge.difficulty, j.codeLanguage")
    List<Tuple> findJudgmentStatsByDifficultyAndLanguage(@Param("userKey") Long userKey);
}