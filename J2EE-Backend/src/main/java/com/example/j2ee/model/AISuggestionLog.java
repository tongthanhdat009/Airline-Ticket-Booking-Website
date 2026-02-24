package com.example.j2ee.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_suggestion_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AISuggestionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_log")
    private Long maLog;

    @Column(name = "session_id", nullable = false, length = 36)
    private String sessionId;

    @Column(name = "ma_admin", nullable = false)
    private Integer maAdmin;

    @Column(name = "so_tin_nhan", nullable = false)
    private Integer soTinNhan;

    @Column(name = "thoi_gian_ms", nullable = false)
    private Integer thoiGianMs;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }
}
