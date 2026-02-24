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
public class ChatMessageDTO {

    private Long maMessage;
    private String noiDung;
    private String nguoiGui; // "customer", "admin", "system"
    private String adminName; // Tên admin nếu admin gửi
    private String messageType; // "TEXT", "SYSTEM"
    private LocalDateTime ngayGui;
}
