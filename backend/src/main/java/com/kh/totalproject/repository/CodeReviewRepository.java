package com.kh.totalproject.repository;

import com.kh.totalproject.entity.CodeReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodeReviewRepository extends JpaRepository<CodeReview, Long> {
    Optional<CodeReview> findByJudgment_JudgmentIdAndReviewVersion(Long judgmentId, Integer reviewVersion);
}
