package com.kh.totalproject.repository;

import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeDifficulty;
import com.kh.totalproject.entity.CodeChallenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CodeChallengeRepository extends JpaRepository<CodeChallenge, Long> {
    List<CodeChallenge> findByDifficulty(CodeChallengeDifficulty difficulty);
}
