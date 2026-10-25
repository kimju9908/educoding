package com.kh.totalproject.learning;

import com.kh.totalproject.entity.User;
import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeLanguage;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import static com.kh.totalproject.learning.LearningModels.*;

@Repository @RequiredArgsConstructor
public class LearningDataRepository {
    private final EntityManager em;
    // Serialize only short claim transactions per user, never the external model call.
    public void lockUser(Long userKey) {
        if (em.find(User.class, userKey, LockModeType.PESSIMISTIC_WRITE) == null)
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
    }
    public List<Outcome> outcomes(Long owner, List<CodeChallengeLanguage> languages, LocalDateTime from, LocalDateTime until) {
        return em.createQuery("select j.codeChallenge.challengeId, j.passed, j.failureCause, j.submittedAt " +
                "from CodeChallengeJudgment j where j.user.userKey=:owner and j.codeLanguage in :langs " +
                "and j.submittedAt >= :from and j.submittedAt <= :until order by j.submittedAt, j.judgmentId", Object[].class)
                .setParameter("owner",owner).setParameter("langs",languages).setParameter("from",from).setParameter("until",until)
                .getResultList().stream().map(r -> new Outcome((Long)r[0], (Boolean)r[1], r[2]==null?null:r[2].toString(),(LocalDateTime)r[3])).toList();
    }
    public Set<Long> solved(Long owner, List<CodeChallengeLanguage> languages, LocalDateTime until) {
        return new HashSet<>(em.createQuery("select distinct j.codeChallenge.challengeId from CodeChallengeJudgment j " +
                "where j.user.userKey=:owner and j.passed=true and j.codeLanguage in :langs and j.submittedAt<=:until",Long.class)
                .setParameter("owner",owner).setParameter("langs",languages).setParameter("until",until).getResultList());
    }
    public List<HintUse> hints(Long owner, List<CodeChallengeLanguage> languages, LocalDateTime from, LocalDateTime until) {
        // Pre-submission hints have no language in the existing schema: deliberately exclude them.
        return em.createQuery("select h.codeChallenge.challengeId, h.level, h.revealedAt from CodeHint h join h.judgment j " +
                "where h.user.userKey=:owner and j.codeLanguage in :langs and h.revealedAt>=:from and h.revealedAt<=:until " +
                "order by h.revealedAt, h.hintId",Object[].class)
                .setParameter("owner",owner).setParameter("langs",languages).setParameter("from",from).setParameter("until",until)
                .getResultList().stream().map(r -> new HintUse((Long)r[0],(Integer)r[1],(LocalDateTime)r[2])).toList();
    }
}
