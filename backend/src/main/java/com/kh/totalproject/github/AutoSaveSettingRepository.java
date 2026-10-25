package com.kh.totalproject.github;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AutoSaveSettingRepository extends JpaRepository<AutoSaveSettingEntity, Long> {
    Optional<AutoSaveSettingEntity> findByUserKey(Long userKey);
}
