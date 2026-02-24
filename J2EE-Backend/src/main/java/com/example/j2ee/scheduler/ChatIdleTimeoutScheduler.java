package com.example.j2ee.scheduler;

import com.example.j2ee.dto.chat.ChatMessageDTO;
import com.example.j2ee.dto.chat.ChatStatsDTO;
import com.example.j2ee.model.ChatMessage;
import com.example.j2ee.model.ChatSession;
import com.example.j2ee.repository.ChatMessageRepository;
import com.example.j2ee.repository.ChatSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
public class ChatIdleTimeoutScheduler {

    private static final Logger log = LoggerFactory.getLogger(ChatIdleTimeoutScheduler.class);

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatIdleTimeoutScheduler(ChatSessionRepository chatSessionRepository,
                                     ChatMessageRepository chatMessageRepository,
                                     SimpMessagingTemplate messagingTemplate) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Chạy mỗi 60 giây để kiểm tra idle timeout
     * - 5 phút: Gửi system message nhắc nhở
     * - 10 phút: Chuyển status IDLE
     * - 30 phút: Auto-close → RESOLVED
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkIdleTimeouts() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Nhắc nhở sau 5 phút không hoạt động
        handleReminders(now);

        // 2. Chuyển IDLE sau 10 phút
        handleIdleStatus(now);

        // 3. Auto-close sau 30 phút
        handleAutoClose(now);
    }

    /**
     * Gửi nhắc nhở sau 5 phút không hoạt động
     */
    private void handleReminders(LocalDateTime now) {
        LocalDateTime fiveMinutesAgo = now.minusMinutes(5);
        List<ChatSession> sessions = chatSessionRepository.findSessionsNeedingReminder(fiveMinutesAgo);

        for (ChatSession session : sessions) {
            log.info("Sending idle reminder for session: {}", session.getSessionId());
            session.setIdleReminderSent(true);
            chatSessionRepository.save(session);

            addSystemMessage(session, "Bạn có còn cần hỗ trợ không? Phiên chat sẽ tự động đóng sau 25 phút nếu không có phản hồi.");
        }
    }

    /**
     * Chuyển status IDLE sau 10 phút
     */
    private void handleIdleStatus(LocalDateTime now) {
        LocalDateTime tenMinutesAgo = now.minusMinutes(10);
        List<ChatSession> sessions = chatSessionRepository.findSessionsToMarkIdle(tenMinutesAgo);

        for (ChatSession session : sessions) {
            log.info("Marking session as IDLE: {}", session.getSessionId());
            session.setTrangThai("IDLE");
            chatSessionRepository.save(session);

            addSystemMessage(session, "Phiên chat đang trong chế độ chờ do không có hoạt động.");

            // Broadcast status update cho customer
            messagingTemplate.convertAndSend("/topic/chat/session/" + session.getSessionId(),
                    Map.of("type", "STATUS_UPDATE", "status", "IDLE"));
        }

        if (!sessions.isEmpty()) {
            broadcastAdminUpdate();
        }
    }

    /**
     * Auto-close sau 30 phút kể từ tin nhắn cuối
     */
    private void handleAutoClose(LocalDateTime now) {
        LocalDateTime thirtyMinutesAgo = now.minusMinutes(30);
        List<ChatSession> sessions = chatSessionRepository.findSessionsToAutoClose(thirtyMinutesAgo);

        for (ChatSession session : sessions) {
            log.info("Auto-closing session: {}", session.getSessionId());
            session.setTrangThai("RESOLVED");
            session.setNgayDong(LocalDateTime.now());
            chatSessionRepository.save(session);

            addSystemMessage(session, "Phiên chat đã tự động đóng do không có hoạt động trong 30 phút. Bạn có thể mở lại trong vòng 24 giờ.");

            // Broadcast status update cho customer
            messagingTemplate.convertAndSend("/topic/chat/session/" + session.getSessionId(),
                    Map.of("type", "STATUS_UPDATE", "status", "RESOLVED"));
        }

        if (!sessions.isEmpty()) {
            broadcastAdminUpdate();
        }
    }

    /**
     * Thêm system message và broadcast qua WebSocket
     */
    private void addSystemMessage(ChatSession session, String content) {
        ChatMessage sysMsg = new ChatMessage();
        sysMsg.setChatSession(session);
        sysMsg.setNoiDung(content);
        sysMsg.setNguoiGui("system");
        sysMsg.setMessageType("SYSTEM");
        chatMessageRepository.save(sysMsg);

        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setMaMessage(sysMsg.getMaMessage());
        dto.setNoiDung(sysMsg.getNoiDung());
        dto.setNguoiGui("system");
        dto.setMessageType("SYSTEM");
        dto.setNgayGui(sysMsg.getNgayGui());

        messagingTemplate.convertAndSend("/topic/chat/session/" + session.getSessionId(), dto);
        messagingTemplate.convertAndSend("/topic/chat/admin/session/" + session.getSessionId(), dto);
    }

    /**
     * Broadcast stats update cho admin
     */
    private void broadcastAdminUpdate() {
        try {
            long waiting = chatSessionRepository.countByTrangThai("WAITING_FOR_ADMIN");
            long inProgress = chatSessionRepository.countByTrangThai("IN_PROGRESS");
            long waitingUser = chatSessionRepository.countByTrangThai("WAITING_FOR_USER");
            long idle = chatSessionRepository.countByTrangThai("IDLE");

            ChatStatsDTO stats = new ChatStatsDTO(waiting, inProgress + waitingUser, idle);
            messagingTemplate.convertAndSend("/topic/chat/admin/updates", stats);
        } catch (Exception e) {
            log.error("Lỗi broadcast admin update", e);
        }
    }
}
