package com.kh.totalproject.github;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AutoCommitJobRepository extends JpaRepository<AutoCommitJobEntity, Long> {
    Optional<AutoCommitJobEntity> findByJudgmentId(Long judgmentId);

    // The last successful write to this exact path (re-solving the same problem
    // targets the same path with a new judgmentId/job row) -- its solutionBlobSha is
    // the baseline AutoCommitJobRunner checks before overwriting (section 6).
    Optional<AutoCommitJobEntity> findFirstByOwnerAndNameAndPathAndStatusOrderByIdDesc(
            String owner, String name, String path, String status);

    List<AutoCommitJobEntity> findByUserKeyOrderByIdDesc(Long userKey, org.springframework.data.domain.Pageable pageable);

    // Picked up by AutoCommitJobScheduler: freshly queued jobs, and TRANSIENT failures whose
    // backoff window has elapsed. CONFLICT/PERMISSION failures are deliberately excluded --
    // those wait for an explicit user retry (docs/github-auto-commit.md section 6).
    @Query("select j from AutoCommitJobEntity j where j.status = 'PENDING' "
            + "or (j.status = 'FAILED' and j.errorCategory = 'TRANSIENT' and j.nextAttemptAt <= :now)")
    List<AutoCommitJobEntity> findDue(@Param("now") LocalDateTime now);
}
