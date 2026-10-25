package com.kh.totalproject.learning;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface LearningPlanRepository extends JpaRepository<LearningPlanEntity,Long> {
    Optional<LearningPlanEntity> findFirstByUserKeyAndProfileKeyOrderByIdDesc(Long userKey, String profileKey);
}
