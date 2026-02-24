package com.example.j2ee.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "chat_session")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChatSession {

    @Id
    @Column(name = "session_id", length = 36)
    private String sessionId;

    @Column(name = "ho_ten", nullable = false, length = 100)
    private String hoTen;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "so_dien_thoai", nullable = false, length = 20)
    private String soDienThoai;

    @Column(name = "trang_thai", nullable = false, length = 30)
    private String trangThai = "WAITING_FOR_ADMIN";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_admin_xu_ly")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "matKhauBam", "cacVaiTro"})
    private TaiKhoanAdmin adminXuLy;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "idle_reminder_sent", nullable = false)
    private Boolean idleReminderSent = false;

    @Column(name = "reopen_count", nullable = false)
    private Integer reopenCount = 0;

    @Column(name = "ngay_tao", nullable = false)
    private LocalDateTime ngayTao;

    @Column(name = "ngay_dong")
    private LocalDateTime ngayDong;

    // ==================== RELATIONS ====================
    @OneToMany(mappedBy = "chatSession", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ChatMessage> danhSachMessage;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
        lastMessageAt = LocalDateTime.now();
    }
}
