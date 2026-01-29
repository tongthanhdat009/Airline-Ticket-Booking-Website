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
 * DTO cho thông tin hóa đơn - response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoaDonResponse {

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
    
    private String trangThai; // DA_PHAT_HANH, DA_HUY, DIEU_CHINH
    private String nguoiLap;
    private String ghiChu;
    
    // Thông tin đơn hàng
    private String emailNguoiDat;
    private String soDienThoaiNguoiDat;
    private String hoTenNguoiDat;
    private BigDecimal tongGiaDonHang;
}
