package com.example.j2ee.dto.maybay;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO cho máy bay
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MayBayResponse {

    private Integer maMayBay;
    private String tenMayBay;
    private String hangMayBay;
    private String loaiMayBay;
    private String soHieu;
    private Integer tongSoGhe;
    private String trangThai;
    private Integer namKhaiThac;

    /**
     * Thông tin sân bay hiện tại mà máy bay đang đỗ
     */
    private CurrentAirportDTO currentAirport;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime deletedAt;

    /**
     * DTO cho thông tin sân bay hiện tại
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CurrentAirportDTO {
        private Integer maSanBay;
        private String maIATA;
        private String tenSanBay;
        private String thanhPho;
    }
}
