package com.example.j2ee.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_message")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_message")
    private Long maMessage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "danhSachMessage"})
    private ChatSession chatSession;

    @Column(name = "noi_dung", nullable = false, columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "nguoi_gui", nullable = false, length = 20)
    private String nguoiGui; // "customer", "admin", "system"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_admin")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "matKhauBam", "cacVaiTro"})
    private TaiKhoanAdmin admin;

    @Column(name = "message_type", nullable = false, length = 20)
    private String messageType = "TEXT"; // "TEXT", "SYSTEM"

    @Column(name = "ngay_gui", nullable = false)
    private LocalDateTime ngayGui;

    @PrePersist
    protected void onCreate() {
        ngayGui = LocalDateTime.now();
    }
}
