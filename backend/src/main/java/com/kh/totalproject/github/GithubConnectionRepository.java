package com.kh.totalproject.github;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GithubConnectionRepository extends JpaRepository<GithubConnectionEntity, Long> {
    Optional<GithubConnectionEntity> findByUserKey(Long userKey);
}
