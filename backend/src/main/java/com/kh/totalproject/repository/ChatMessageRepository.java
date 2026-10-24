package com.kh.totalproject.repository;

import com.kh.totalproject.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    // 최신순으로 N개만 가져온 뒤 서비스 계층에서 시간순으로 뒤집어서 사용
    List<ChatMessage> findBySessionIdOrderByIdDesc(String sessionId, Pageable pageable);
}
