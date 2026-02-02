package com.example.j2ee.dto.datcho;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO response cho admin quản lý đặt chỗ
 * Chứa thông tin đầy đủ về booking, passenger, flight, seat
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatChoAdminResponse {
    
    // Thông tin đặt chỗ
    private Integer maDatCho;
    private LocalDateTime ngayDatCho;
    private String trangThai;
    private BigDecimal giaVe;
    private boolean checkInStatus;
    private LocalDateTime checkInTime;
    
    // Thông tin hành khách
    private Integer maHanhKhach;
    private String hoVaTen;
    private String cccd;
    private String gioiTinh;
    private String ngaySinh;
    private String soDienThoai;
    private String email;
    
    // Thông tin chuyến bay
    private Integer maChuyenBay;
    private String soHieuChuyenBay;
    private String sanBayDi;
    private String maSanBayDi;
    private String sanBayDen;
    private String maSanBayDen;
    private LocalDateTime ngayGioDi;
    private LocalDateTime ngayGioDen;
    private String trangThaiChuyenBay;
    
    // Thông tin ghế
    private Integer maGhe;
    private String soGhe;
    private String loaiGhe;
    private String hangGhe;
    
    // Thông tin hạng vé
    private String tenHangVe;
    
    // Thông tin đơn hàng
    private Integer maDonHang;
    private String pnr;
    private String trangThaiThanhToan;
    private BigDecimal soTienDaThanhToan;
}
