package com.example.j2ee.dto.datcho;

import lombok.Data;

import java.math.BigDecimal;

/**
 * DTO cho response đổi hạng vé
 * Trả về thông tin về phí chênh lệch
 */
@Data
public class DoiHangVeResponse {
    
    private Integer maDatCho;
    private String tenHangVeCu;
    private String tenHangVeMoi;
    private BigDecimal giaVeCu;
    private BigDecimal giaVeMoi;
    private BigDecimal chenhLech;
    private BigDecimal phiDoi;
    private BigDecimal tongThanhToan;
    private String loaiGiaoDich; // "THU_THEM" hoặc "HOAN_TIEN"
    
    // Thông tin ghế mới
    private String soGheMoi;
    private String hangGheMoi;
    
    // Thông tin chuyến bay
    private String soHieuChuyenBay;
    
    public DoiHangVeResponse() {
        this.chenhLech = BigDecimal.ZERO;
        this.phiDoi = BigDecimal.ZERO;
        this.tongThanhToan = BigDecimal.ZERO;
    }
}
