package com.example.j2ee.dto.hoadon;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO cho chi tiết hóa đơn - response chi tiết đầy đủ
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoaDonDetailResponse {

    private Integer maHoaDon;
    private Integer maDonHang;
    private String soHoaDon;
    private String pnr;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime ngayLap;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate ngayHachToan;
    
    private BigDecimal tongTien;
    private BigDecimal thueVAT;
    private BigDecimal tongThanhToan;
    private String trangThai;
    private String nguoiLap;
    private String ghiChu;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    // Thông tin đơn hàng chi tiết
    private String emailNguoiDat;
    private String soDienThoaiNguoiDat;
    private String hoTenNguoiDat;
    private String trangThaiDonHang;
    private BigDecimal tongGiaDonHang;
}
