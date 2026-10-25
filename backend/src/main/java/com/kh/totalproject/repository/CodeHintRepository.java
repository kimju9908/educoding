package com.kh.totalproject.repository;

import com.kh.totalproject.entity.CodeHint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodeHintRepository extends JpaRepository<CodeHint, Long> {
    List<CodeHint> findByAttempt_HintAttemptIdOrderByLevelAsc(Long hintAttemptId);
}
