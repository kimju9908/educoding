package com.kh.totalproject.github;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GithubAnalysisRepository extends JpaRepository<GithubAnalysisEntity, Long> {
    Optional<GithubAnalysisEntity> findFirstByUserKeyOrderByIdDesc(Long userKey);
}
