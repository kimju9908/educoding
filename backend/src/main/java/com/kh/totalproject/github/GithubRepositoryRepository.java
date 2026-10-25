package com.kh.totalproject.github;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GithubRepositoryRepository extends JpaRepository<GithubRepositoryEntity, Long> {
    List<GithubRepositoryEntity> findByConnectionId(Long connectionId);

    List<GithubRepositoryEntity> findByConnectionIdAndSelectedTrue(Long connectionId);

    void deleteByConnectionId(Long connectionId);
}
