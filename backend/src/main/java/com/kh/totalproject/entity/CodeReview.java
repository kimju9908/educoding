package com.kh.totalproject.entity;

import com.kh.totalproject.constant.codereview.CodeReviewStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 정답 제출(CodeChallengeJudgment) 1건에 대한 AI 코드 리뷰.
 * (judgment_id, review_version) 유니크 제약으로 같은 제출·같은 버전 리뷰가 두 번 생성되지 않게 막고,
 * @Version 낙관적 락으로 FAILED → PENDING 재시도 선점이 동시에 두 번 일어나지 않게 막는다.
 * 리뷰 형식(프롬프트·응답 구조)이 바뀌면 reviewVersion을 올려 기존 리뷰와 구분한다.
 */
@Entity
@Table(name = "code_review",
        uniqueConstraints = @UniqueConstraint(name = "uk_code_review_judgment_version",
                columnNames = {"judgment_id", "review_version"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CodeReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "user_key")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "judgment_id")
    private CodeChallengeJudgment judgment;

    @Column(nullable = false, name = "review_version")
    private Integer reviewVersion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CodeReviewStatus status;

    // 검증을 통과한 리뷰 본문(JSON). COMPLETED일 때만 채워짐.
    @Lob
    @Column(nullable = true, columnDefinition = "LONGTEXT")
    private String contentJson;

    @Column(nullable = true, length = 500)
    private String errorMessage;

    @Column(nullable = false)
    private Integer attemptCount;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    @Builder
    public CodeReview(User user, CodeChallengeJudgment judgment, Integer reviewVersion) {
        this.user = user;
        this.judgment = judgment;
        this.reviewVersion = reviewVersion;
        this.status = CodeReviewStatus.PENDING;
        this.attemptCount = 1;
    }

    // FAILED 또는 오래 멈춘 PENDING을 다시 생성 중으로 선점
    public void restart() {
        this.status = CodeReviewStatus.PENDING;
        this.errorMessage = null;
        this.attemptCount = this.attemptCount + 1;
    }

    public void complete(String contentJson) {
        this.status = CodeReviewStatus.COMPLETED;
        this.contentJson = contentJson;
        this.errorMessage = null;
    }

    public void fail(String errorMessage) {
        this.status = CodeReviewStatus.FAILED;
        this.contentJson = null;
        this.errorMessage = errorMessage;
    }
}
