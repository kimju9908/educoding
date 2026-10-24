package com.kh.totalproject.entity;

import com.kh.totalproject.constant.ChatRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * RAG 챗봇의 대화 상태를 세션 단위로 기록하는 엔티티입니다.
 * /api/chatbot/** 는 permitAll (SecurityConfig 참고) 로 비로그인 사용자도 쓸 수 있으므로
 * User와 연관시키지 않고, 프론트에서 생성한 sessionId로만 턴을 구분합니다.
 */
@Entity
@Table(name = "chat_message")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    @Id
    @Column(name = "message_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false, length = 100)
    private String sessionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ChatRole role;

    // @Lob만 쓰면 하이버네이트가 MySQL에서 이걸 tinytext(255바이트)로 매핑해서 Claude 답변
    // 길이에서 바로 "Data too long" 에러가 났음 -- longtext로 명시.
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void defaultTime() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
