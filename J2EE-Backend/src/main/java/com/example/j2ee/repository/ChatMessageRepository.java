package com.example.j2ee.repository;

import com.example.j2ee.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /**
     * Lấy danh sách tin nhắn theo session, sắp xếp theo thời gian gửi
     */
    List<ChatMessage> findByChatSession_SessionIdOrderByNgayGuiAsc(String sessionId);

    /**
     * Đếm số tin nhắn trong session
     */
    long countByChatSession_SessionId(String sessionId);
}
