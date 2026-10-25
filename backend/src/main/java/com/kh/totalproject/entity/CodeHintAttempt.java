package com.kh.totalproject.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 단계별 AI 힌트의 "풀이 시도" 1건과 그 진행 상태.
 *
 * 풀이 시도 = (사용자, 문제, 기준). 기준은 둘 중 하나다.
 *  - 제출 전: 문제 조건만 참고 (judgment = null, attemptKey = "problem")
 *  - 오답 제출 후: 사용자가 고른 오답 제출 1건 (attemptKey = "judgment:{id}")
 * 새 제출은 새 기준이므로 새 풀이 시도가 되고 1단계부터 다시 생성한다. 이전 시도의 힌트는 그대로 남아 다시 볼 수 있다.
 * 제출하지 않은 에디터 코드는 서버에 기록이 없어 기준이 될 수 없다 (코드를 바꿔도 기존 시도에 영향 없음).
 *
 * 공개 단계(revealedLevel)는 서버만 올린다. 생성 중인 단계(generatingLevel)와 생성 차수(generationCount)로
 * 늦게 끝난 이전 요청이 결과를 덮어쓰지 못하게 하고, @Version 낙관적 락으로 동시 선점을 막는다.
 */
@Entity
@Table(name = "code_hint_attempt",
        uniqueConstraints = @UniqueConstraint(name = "uk_code_hint_attempt",
                columnNames = {"user_key", "challenge_id", "attempt_key", "hint_version"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CodeHintAttempt {
    public static final String PROBLEM_KEY = "problem";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long hintAttemptId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "user_key")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "challenge_id")
    private CodeChallenge codeChallenge;

    // 오답 제출 기준 시도면 그 제출, 제출 전 시도면 null
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = true, name = "judgment_id")
    private CodeChallengeJudgment judgment;

    // 유니크 제약용 기준 키 (MySQL 유니크 제약은 NULL을 서로 다른 값으로 보기 때문에 judgment_id를 직접 쓰지 않음)
    @Column(nullable = false, name = "attempt_key", length = 40)
    private String attemptKey;

    @Column(nullable = false, name = "hint_version")
    private Integer hintVersion;

    // 공개 완료된 마지막 단계 (0 = 아직 없음)
    @Column(nullable = false)
    private Integer revealedLevel;

    // 생성 중인 단계 (없으면 null)
    @Column(nullable = true)
    private Integer generatingLevel;

    // 생성을 선점할 때마다 1씩 증가 -- 결과 저장 시 자기 차수인지 확인한다
    @Column(nullable = false)
    private Integer generationCount;

    @Column(nullable = true)
    private LocalDateTime generationStartedAt;

    // 직전 생성 실패 사유 (다음 단계 생성이 성공하면 지워짐)
    @Column(nullable = true, length = 500)
    private String lastError;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    @Builder
    public CodeHintAttempt(User user, CodeChallenge codeChallenge, CodeChallengeJudgment judgment, Integer hintVersion) {
        this.user = user;
        this.codeChallenge = codeChallenge;
        this.judgment = judgment;
        this.attemptKey = keyOf(judgment == null ? null : judgment.getJudgmentId());
        this.hintVersion = hintVersion;
        this.revealedLevel = 0;
        this.generationCount = 0;
    }

    public static String keyOf(Long judgmentId) {
        return judgmentId == null ? PROBLEM_KEY : "judgment:" + judgmentId;
    }

    public void startGenerating(int level) {
        this.generatingLevel = level;
        this.generationCount = this.generationCount + 1;
        this.generationStartedAt = LocalDateTime.now();
        this.lastError = null;
    }

    public void reveal(int level) {
        this.revealedLevel = level;
        this.generatingLevel = null;
        this.lastError = null;
    }

    // 실패해도 revealedLevel은 그대로 -- 단계가 소비되지 않는다
    public void failGenerating(String errorMessage) {
        this.generatingLevel = null;
        this.lastError = errorMessage;
    }
}
