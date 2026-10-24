package com.kh.totalproject.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"user_key", "mentor_id"})) // 고유 제약 추가
@Builder
public class MentorReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Long id; // Review Table id

    @Column(name = "review_text", length = 200)
    private String reviewText; // 리뷰 내용

    @Column(name = "rating")
    private double rating = 0.0;; // 별점 (예: 4.5, 3.0 등)

    @Column(name = "created_at")
    private LocalDateTime createdAt; // 멘토 게시물 생성 날짜

    @ManyToOne
    @JoinColumn(name = "user_key")
    private User user;

    @ManyToOne
    @JoinColumn(name = "mentor_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Mentor mentor;

}
