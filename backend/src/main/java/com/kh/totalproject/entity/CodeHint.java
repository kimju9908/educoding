package com.kh.totalproject.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 공개된 힌트 1단계. 생성에 성공한 단계만 저장된다 (실패는 CodeHintAttempt.lastError에만 남음).
 * (hint_attempt_id, level) 유니크 제약으로 같은 단계가 두 번 저장되지 않는다.
 * 사용자·문제·관련 제출·공개 시각을 함께 남겨 이후 학습 추천에서 "어느 문제에서 몇 단계까지 힌트를 봤는지"를 조회할 수 있다.
 */
@Entity
@Table(name = "code_hint",
        uniqueConstraints = @UniqueConstraint(name = "uk_code_hint_attempt_level",
                columnNames = {"hint_attempt_id", "level"}),
        indexes = @Index(name = "idx_code_hint_user_challenge", columnList = "user_key, challenge_id"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CodeHint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long hintId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "hint_attempt_id")
    private CodeHintAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "user_key")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "challenge_id")
    private CodeChallenge codeChallenge;

    // 이 힌트가 참고한 오답 제출 (제출 전 힌트면 null)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = true, name = "judgment_id")
    private CodeChallengeJudgment judgment;

    @Column(nullable = false)
    private Integer level;

    // 검증을 통과한 힌트 본문(JSON, CodeHintContent)
    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String contentJson;

    // 이 단계를 요청할 때 사용자가 남긴 질문 (없으면 null)
    @Column(nullable = true, length = 300)
    private String question;

    @Column(nullable = false)
    private LocalDateTime revealedAt;

    @Builder
    public CodeHint(CodeHintAttempt attempt, Integer level, String contentJson, String question) {
        this.attempt = attempt;
        this.user = attempt.getUser();
        this.codeChallenge = attempt.getCodeChallenge();
        this.judgment = attempt.getJudgment();
        this.level = level;
        this.contentJson = contentJson;
        this.question = question;
        this.revealedAt = LocalDateTime.now();
    }
}
