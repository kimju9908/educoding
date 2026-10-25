package com.kh.totalproject.repository;

import com.kh.totalproject.entity.CodeHintAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodeHintAttemptRepository extends JpaRepository<CodeHintAttempt, Long> {
    Optional<CodeHintAttempt> findByUser_UserKeyAndCodeChallenge_ChallengeIdAndAttemptKeyAndHintVersion(
            Long userKey, Long challengeId, String attemptKey, Integer hintVersion);
}
