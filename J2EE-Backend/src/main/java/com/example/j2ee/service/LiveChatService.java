package com.example.j2ee.service;

import com.example.j2ee.dto.chat.*;
import com.example.j2ee.model.ChatMessage;
import com.example.j2ee.model.ChatSession;
import com.example.j2ee.model.TaiKhoanAdmin;
import com.example.j2ee.repository.ChatMessageRepository;
import com.example.j2ee.repository.ChatSessionRepository;
import com.example.j2ee.repository.TaiKhoanAdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LiveChatService {

    private static final Logger log = LoggerFactory.getLogger(LiveChatService.class);

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final TaiKhoanAdminRepository taiKhoanAdminRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public LiveChatService(ChatSessionRepository chatSessionRepository,
                           ChatMessageRepository chatMessageRepository,
                           TaiKhoanAdminRepository taiKhoanAdminRepository,
                           SimpMessagingTemplate messagingTemplate) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.taiKhoanAdminRepository = taiKhoanAdminRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // ==================== CUSTOMER APIs ====================

    /**
     * Bắt đầu hoặc khôi phục phiên chat
     */
    @Transactional
    public StartChatResponse startChat(StartChatRequest request) {
        LocalDateTime since24h = LocalDateTime.now().minusHours(24);

        // 1. Kiểm tra session đang active
        List<ChatSession> activeSessions = chatSessionRepository
                .findActiveSessionsByEmail(request.getEmail(), since24h);
        if (!activeSessions.isEmpty()) {
            ChatSession session = activeSessions.get(0);
            return new StartChatResponse(session.getSessionId(), session.getTrangThai(),
                    "Khôi phục phiên chat trước đó");
        }

        // 2. Kiểm tra session đã đóng trong 24h (reopen)
        List<ChatSession> closedSessions = chatSessionRepository
                .findRecentClosedSessionsByEmail(request.getEmail(), since24h);
        if (!closedSessions.isEmpty()) {
            ChatSession session = closedSessions.get(0);
            session.setTrangThai("WAITING_FOR_ADMIN");
            session.setReopenCount(session.getReopenCount() + 1);
            session.setNgayDong(null);
            session.setIdleReminderSent(false);
            session.setLastMessageAt(LocalDateTime.now());
            chatSessionRepository.save(session);

            // Gửi system message
            addSystemMessage(session, "Khách hàng đã mở lại phiên chat");

            // Broadcast cho admin
            broadcastAdminUpdate();

            return new StartChatResponse(session.getSessionId(), session.getTrangThai(),
                    "Mở lại phiên chat trước đó");
        }

        // 3. Tạo session mới
        ChatSession session = new ChatSession();
        session.setSessionId(UUID.randomUUID().toString());
        session.setHoTen(request.getHoTen());
        session.setEmail(request.getEmail());
        session.setSoDienThoai(request.getSoDienThoai());
        session.setTrangThai("WAITING_FOR_ADMIN");
        session.setIdleReminderSent(false);
        session.setReopenCount(0);
        chatSessionRepository.save(session);

        // Gửi system message
        addSystemMessage(session, "Phiên chat mới được tạo. Vui lòng đợi nhân viên hỗ trợ.");

        // Broadcast cho admin
        broadcastAdminUpdate();

        return new StartChatResponse(session.getSessionId(), "WAITING_FOR_ADMIN",
                "Phiên chat mới đã được tạo");
    }

    /**
     * Customer gửi tin nhắn
     */
    @Transactional
    public ChatMessageDTO sendCustomerMessage(SendMessageRequest request) {
        ChatSession session = chatSessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException("Phiên chat không tồn tại"));

        if ("RESOLVED".equals(session.getTrangThai()) || "CLOSED".equals(session.getTrangThai())) {
            throw new RuntimeException("Phiên chat đã đóng. Vui lòng tạo phiên mới.");
        }

        // Nếu đang WAITING_FOR_USER hoặc IDLE, chuyển về IN_PROGRESS
        if ("WAITING_FOR_USER".equals(session.getTrangThai()) || "IDLE".equals(session.getTrangThai())) {
            session.setTrangThai("IN_PROGRESS");
            session.setIdleReminderSent(false);
        }

        // Tạo message
        ChatMessage message = new ChatMessage();
        message.setChatSession(session);
        message.setNoiDung(request.getNoiDung());
        message.setNguoiGui("customer");
        message.setMessageType("TEXT");
        chatMessageRepository.save(message);

        // Cập nhật session
        session.setLastMessageAt(LocalDateTime.now());
        chatSessionRepository.save(session);

        ChatMessageDTO dto = toMessageDTO(message);

        // Broadcast tin nhắn cho admin qua WebSocket
        messagingTemplate.convertAndSend("/topic/chat/admin/session/" + session.getSessionId(), dto);
        broadcastAdminUpdate();

        return dto;
    }

    /**
     * Lấy lịch sử chat
     */
    public List<ChatMessageDTO> getChatHistory(String sessionId) {
        return chatMessageRepository.findByChatSession_SessionIdOrderByNgayGuiAsc(sessionId)
                .stream()
                .map(this::toMessageDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy thông tin session
     */
    public ChatSessionDTO getSessionInfo(String sessionId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Phiên chat không tồn tại"));
        return toSessionDTO(session);
    }

    // ==================== ADMIN APIs ====================

    /**
     * Lấy danh sách sessions cho admin
     */
    public List<ChatSessionDTO> getAdminSessions() {
        List<String> statuses = Arrays.asList(
                "WAITING_FOR_ADMIN", "IN_PROGRESS", "WAITING_FOR_USER", "IDLE", "RESOLVED");
        return chatSessionRepository.findByTrangThaiIn(statuses)
                .stream()
                .map(this::toSessionDTO)
                .collect(Collectors.toList());
    }

    /**
     * Admin nhận chat (assign)
     */
    @Transactional
    public ChatSessionDTO assignChat(String sessionId, int adminId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Phiên chat không tồn tại"));

        TaiKhoanAdmin admin = taiKhoanAdminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin không tồn tại"));

        session.setAdminXuLy(admin);
        session.setTrangThai("IN_PROGRESS");
        session.setIdleReminderSent(false);
        session.setLastMessageAt(LocalDateTime.now());
        chatSessionRepository.save(session);

        // Gửi system message
        addSystemMessage(session, "Nhân viên " + admin.getHoVaTen() + " đã tham gia hỗ trợ");

        // Broadcast cho customer
        messagingTemplate.convertAndSend("/topic/chat/session/" + sessionId,
                Map.of("type", "STATUS_UPDATE", "status", "IN_PROGRESS",
                        "adminName", admin.getHoVaTen()));

        broadcastAdminUpdate();

        return toSessionDTO(session);
    }

    /**
     * Admin gửi tin nhắn
     */
    @Transactional
    public ChatMessageDTO sendAdminMessage(String sessionId, String noiDung, int adminId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Phiên chat không tồn tại"));

        TaiKhoanAdmin admin = taiKhoanAdminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin không tồn tại"));

        // Nếu chưa assign, tự assign
        if (session.getAdminXuLy() == null) {
            session.setAdminXuLy(admin);
            session.setTrangThai("IN_PROGRESS");
            addSystemMessage(session, "Nhân viên " + admin.getHoVaTen() + " đã tham gia hỗ trợ");
        }

        // Chuyển status thành WAITING_FOR_USER
        session.setTrangThai("WAITING_FOR_USER");
        session.setIdleReminderSent(false);

        // Tạo message
        ChatMessage message = new ChatMessage();
        message.setChatSession(session);
        message.setNoiDung(noiDung);
        message.setNguoiGui("admin");
        message.setAdmin(admin);
        message.setMessageType("TEXT");
        chatMessageRepository.save(message);

        // Cập nhật session
        session.setLastMessageAt(LocalDateTime.now());
        chatSessionRepository.save(session);

        ChatMessageDTO dto = toMessageDTO(message);

        // Broadcast cho customer qua WebSocket
        messagingTemplate.convertAndSend("/topic/chat/session/" + sessionId, dto);
        broadcastAdminUpdate();

        return dto;
    }

    /**
     * Admin đóng chat
     */
    @Transactional
    public ChatSessionDTO closeChat(String sessionId, int adminId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Phiên chat không tồn tại"));

        TaiKhoanAdmin admin = taiKhoanAdminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin không tồn tại"));

        session.setTrangThai("CLOSED");
        session.setNgayDong(LocalDateTime.now());
        chatSessionRepository.save(session);

        // Gửi system message
        addSystemMessage(session, "Phiên chat đã được đóng bởi " + admin.getHoVaTen());

        // Broadcast cho customer
        messagingTemplate.convertAndSend("/topic/chat/session/" + sessionId,
                Map.of("type", "STATUS_UPDATE", "status", "CLOSED"));

        broadcastAdminUpdate();

        return toSessionDTO(session);
    }

    /**
     * Lấy thống kê chat cho admin
     */
    public ChatStatsDTO getChatStats() {
        long waiting = chatSessionRepository.countByTrangThai("WAITING_FOR_ADMIN");
        long inProgress = chatSessionRepository.countByTrangThai("IN_PROGRESS");
        long waitingUser = chatSessionRepository.countByTrangThai("WAITING_FOR_USER");
        long idle = chatSessionRepository.countByTrangThai("IDLE");

        return new ChatStatsDTO(waiting, inProgress + waitingUser, idle);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Thêm system message
     */
    private void addSystemMessage(ChatSession session, String content) {
        ChatMessage sysMsg = new ChatMessage();
        sysMsg.setChatSession(session);
        sysMsg.setNoiDung(content);
        sysMsg.setNguoiGui("system");
        sysMsg.setMessageType("SYSTEM");
        chatMessageRepository.save(sysMsg);

        // Broadcast system message cho customer
        ChatMessageDTO dto = toMessageDTO(sysMsg);
        messagingTemplate.convertAndSend("/topic/chat/session/" + session.getSessionId(), dto);
        messagingTemplate.convertAndSend("/topic/chat/admin/session/" + session.getSessionId(), dto);
    }

    /**
     * Broadcast cập nhật danh sách sessions cho admin
     */
    private void broadcastAdminUpdate() {
        try {
            ChatStatsDTO stats = getChatStats();
            messagingTemplate.convertAndSend("/topic/chat/admin/updates", stats);
        } catch (Exception e) {
            log.error("Lỗi broadcast admin update", e);
        }
    }

    /**
     * Convert entity → DTO cho message
     */
    private ChatMessageDTO toMessageDTO(ChatMessage msg) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setMaMessage(msg.getMaMessage());
        dto.setNoiDung(msg.getNoiDung());
        dto.setNguoiGui(msg.getNguoiGui());
        dto.setMessageType(msg.getMessageType());
        dto.setNgayGui(msg.getNgayGui());
        if (msg.getAdmin() != null) {
            dto.setAdminName(msg.getAdmin().getHoVaTen());
        }
        return dto;
    }

    /**
     * Convert entity → DTO cho session
     */
    private ChatSessionDTO toSessionDTO(ChatSession session) {
        ChatSessionDTO dto = new ChatSessionDTO();
        dto.setSessionId(session.getSessionId());
        dto.setHoTen(session.getHoTen());
        dto.setEmail(session.getEmail());
        dto.setSoDienThoai(session.getSoDienThoai());
        dto.setTrangThai(session.getTrangThai());
        dto.setLastMessageAt(session.getLastMessageAt());
        dto.setNgayTao(session.getNgayTao());
        dto.setNgayDong(session.getNgayDong());
        dto.setReopenCount(session.getReopenCount());

        if (session.getAdminXuLy() != null) {
            dto.setAdminName(session.getAdminXuLy().getHoVaTen());
            dto.setAdminId(session.getAdminXuLy().getMaTaiKhoan());
        }

        // Message count & last message preview
        List<ChatMessage> messages = chatMessageRepository
                .findByChatSession_SessionIdOrderByNgayGuiAsc(session.getSessionId());
        dto.setMessageCount(messages.size());
        if (!messages.isEmpty()) {
            ChatMessage lastMsg = messages.get(messages.size() - 1);
            String preview = lastMsg.getNoiDung();
            if (preview.length() > 50) {
                preview = preview.substring(0, 50) + "...";
            }
            dto.setLastMessage(preview);
        }

        return dto;
    }
}
