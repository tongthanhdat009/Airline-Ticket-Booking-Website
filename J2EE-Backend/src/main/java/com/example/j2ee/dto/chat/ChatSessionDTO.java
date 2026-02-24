package com.example.j2ee.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatSessionDTO {

    private String sessionId;
    private String hoTen;
    private String email;
    private String soDienThoai;
    private String trangThai;
    private String adminName; // Tên admin đang xử lý
    private Integer adminId;
    private LocalDateTime lastMessageAt;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayDong;
    private Integer reopenCount;
    private long messageCount; // Tổng số tin nhắn
    private String lastMessage; // Tin nhắn cuối cùng (preview)
}
