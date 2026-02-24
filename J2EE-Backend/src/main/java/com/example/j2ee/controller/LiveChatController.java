package com.example.j2ee.controller;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.chat.*;
import com.example.j2ee.service.LiveChatService;
import com.example.j2ee.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller quản lý Live Chat
 * - Customer endpoints: /api/chat/*
 * - Admin endpoints: /api/chat/admin/*
 */
@RestController
@RequestMapping("/api/chat")
public class LiveChatController {

    private final LiveChatService liveChatService;

    public LiveChatController(LiveChatService liveChatService) {
        this.liveChatService = liveChatService;
    }

    // ==================== CUSTOMER ENDPOINTS ====================

    /**
     * Bắt đầu phiên chat (hoặc khôi phục phiên cũ)
     */
    @PostMapping("/start")
    public ResponseEntity<ApiResponse<StartChatResponse>> startChat(
            @Valid @RequestBody StartChatRequest request) {
        StartChatResponse response = liveChatService.startChat(request);
        return ResponseEntity.ok(ApiResponse.success("Khởi tạo phiên chat thành công", response));
    }

    /**
     * Customer gửi tin nhắn
     */
    @PostMapping("/message")
    public ResponseEntity<ApiResponse<ChatMessageDTO>> sendMessage(
            @Valid @RequestBody SendMessageRequest request) {
        ChatMessageDTO message = liveChatService.sendCustomerMessage(request);
        return ResponseEntity.ok(ApiResponse.success("Gửi tin nhắn thành công", message));
    }

    /**
     * Lấy lịch sử chat theo sessionId
     */
    @GetMapping("/history/{sessionId}")
    public ResponseEntity<ApiResponse<List<ChatMessageDTO>>> getChatHistory(
            @PathVariable String sessionId) {
        List<ChatMessageDTO> history = liveChatService.getChatHistory(sessionId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    /**
     * Lấy thông tin session
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponse<ChatSessionDTO>> getSessionInfo(
            @PathVariable String sessionId) {
        ChatSessionDTO session = liveChatService.getSessionInfo(sessionId);
        return ResponseEntity.ok(ApiResponse.success(session));
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Lấy danh sách chat sessions (admin)
     */
    @GetMapping("/admin/sessions")
    @RequirePermission(feature = "SUPPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ChatSessionDTO>>> getAdminSessions() {
        List<ChatSessionDTO> sessions = liveChatService.getAdminSessions();
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    /**
     * Admin nhận chat (assign cho mình)
     */
    @PostMapping("/admin/assign")
    @RequirePermission(feature = "SUPPORT", action = "UPDATE")
    public ResponseEntity<ApiResponse<ChatSessionDTO>> assignChat(
            @Valid @RequestBody AssignRequest request) {
        Integer adminId = SecurityUtil.getCurrentAdminId();
        if (adminId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Không xác định được admin"));
        }
        ChatSessionDTO session = liveChatService.assignChat(request.getSessionId(), adminId);
        return ResponseEntity.ok(ApiResponse.success("Đã nhận phiên chat", session));
    }

    /**
     * Admin gửi tin nhắn
     */
    @PostMapping("/admin/message")
    @RequirePermission(feature = "SUPPORT", action = "UPDATE")
    public ResponseEntity<ApiResponse<ChatMessageDTO>> sendAdminMessage(
            @Valid @RequestBody SendMessageRequest request) {
        Integer adminId = SecurityUtil.getCurrentAdminId();
        if (adminId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Không xác định được admin"));
        }
        ChatMessageDTO message = liveChatService.sendAdminMessage(
                request.getSessionId(), request.getNoiDung(), adminId);
        return ResponseEntity.ok(ApiResponse.success("Gửi tin nhắn thành công", message));
    }

    /**
     * Admin đóng chat
     */
    @PostMapping("/admin/close")
    @RequirePermission(feature = "SUPPORT", action = "UPDATE")
    public ResponseEntity<ApiResponse<ChatSessionDTO>> closeChat(
            @Valid @RequestBody CloseRequest request) {
        Integer adminId = SecurityUtil.getCurrentAdminId();
        if (adminId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Không xác định được admin"));
        }
        ChatSessionDTO session = liveChatService.closeChat(request.getSessionId(), adminId);
        return ResponseEntity.ok(ApiResponse.success("Đã đóng phiên chat", session));
    }

    /**
     * Lấy thống kê chat (admin)
     */
    @GetMapping("/admin/stats")
    @RequirePermission(feature = "SUPPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<ChatStatsDTO>> getChatStats() {
        ChatStatsDTO stats = liveChatService.getChatStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
