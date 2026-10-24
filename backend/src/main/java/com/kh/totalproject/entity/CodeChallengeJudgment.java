package com.kh.totalproject.entity;

import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeLanguage;
import com.kh.totalproject.constant.codechallenge.enums.FailureCause;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@ToString
// JPA(Hibernate 등)는 엔티티 객체를 프록시 객체 생성, 리플렉션 사용에 기본 생성자를 요구하므로 추가
// 필수 필드(nullable = false)가 초기화되지 않은 상태로 외부에서 엔티티를 사용할 수 없도록 protected 접근 제한자 설정 (JPA는 기본 생성자 사용 가능)
// , 반면 일반 코드에서는 설정한 builder 패턴 또는 전체 필드 생성자를 통해 초기화 강제
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class CodeChallengeJudgment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long judgmentId;

    // 1명의 유저는 n개의 제출 1개의 제출은 1명의 유저
    @ManyToOne
    @JoinColumn(nullable = false, name="user_key")
    private User user;

    // 1개의 문제는 n개의 제출을 가질 수 있고, 1개의 제출은 1개의 문제를 가진다.
    @ManyToOne
    @JoinColumn(nullable = false, name="challenge_id")
    private CodeChallenge codeChallenge;

    @Column(nullable = false)
    private Boolean passed;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CodeChallengeLanguage codeLanguage;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String code;

    @Column(nullable = false)
    private Integer codeByteSize;

    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @Column(nullable = true)
    private Float maxMemoryUsageMb;

    @Column(nullable = true)
    private Integer maxElapsedTimeMs;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private FailureCause failureCause;

    @Lob
    @Column(nullable = true, columnDefinition = "TEXT")
    private String failureDetail;

    @Builder
    public CodeChallengeJudgment(User user, CodeChallenge codeChallenge, boolean passed,
                                 CodeChallengeLanguage codeLanguage, String code, int codeByteSize,
                                 LocalDateTime submittedAt, Float maxMemoryUsageMb, Integer maxElapsedTimeMs,
                                 FailureCause failureCause, String failureDetail) {
        this.user = user;
        this.codeChallenge = codeChallenge;
        this.passed = passed;
        this.codeLanguage = codeLanguage;
        this.code = code;
        this.codeByteSize = codeByteSize;
        this.submittedAt = submittedAt;

        // 명시적 대입 없는 필드는 null 값으로 초기화
        if (passed) {
            this.maxMemoryUsageMb = maxMemoryUsageMb;
            this.maxElapsedTimeMs = maxElapsedTimeMs;
        } else {
            this.failureCause = failureCause;
            this.failureDetail = failureDetail;
        }
    }
}
