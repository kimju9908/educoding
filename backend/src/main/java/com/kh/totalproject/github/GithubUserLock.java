package com.kh.totalproject.github;

import com.kh.totalproject.entity.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** Serializes per-user GitHub connect/install/analyze operations by locking the
 * existing User row -- mirrors learning/LearningDataRepository.lockUser(). A
 * connection or analysis row may not exist yet (first connect, first analysis),
 * so locking the always-present User row is what actually makes the claim atomic. */
@Component @RequiredArgsConstructor
public class GithubUserLock {
    private final EntityManager em;

    public void lock(Long userKey) {
        if (em.find(User.class, userKey, LockModeType.PESSIMISTIC_WRITE) == null)
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
    }
}
