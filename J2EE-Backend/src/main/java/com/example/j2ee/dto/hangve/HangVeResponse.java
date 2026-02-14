package com.example.j2ee.dto.hangve;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO cho hạng vé
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HangVeResponse {

    private Integer maHangVe;
    private String tenHangVe;
    private String moTa;

    // UI color fields
    private String mauNen;
    private String mauVien;
    private String mauChu;
    private String mauHeader;
    private String mauIcon;
    private String mauRing;
    private String mauBadge;
    private String hangBac;

    // Usage statistics
    private Long soLuongGhe; // Số ghế đang sử dụng hạng vé này
    private Long soLuongGia; // Số giá chuyến bay đang sử dụng hạng vé này

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime deletedAt;
}
