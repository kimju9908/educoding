package com.kh.totalproject.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

@Slf4j
@Entity
@Getter
@Setter
@ToString(exclude = {"board", "user"})    // 순환 참조 방지
@Table(name = "comment")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Comment {
    @Id
    @Column(name = "comment_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")  // FK 는 해당 객체의 PK 여야함
    private Board board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_key", nullable = false, referencedColumnName = "user_key")
    private User user;

    @Column(length = 1000)
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 새로운 댓글 생성시 작동
    @PrePersist
    public void defaultTime() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // 댓글 업데이트시 작동
    @PreUpdate
    public void updatedTime() {
        updatedAt = LocalDateTime.now();
    }
}