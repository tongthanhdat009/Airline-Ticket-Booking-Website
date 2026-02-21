package com.example.j2ee.dto;

import java.math.BigDecimal;

/**
 * DTO cho thống kê tỷ lệ trạng thái đơn hàng
 * Dùng cho Pie Chart
 */
public class ThongKeTrangThaiDonHangDTO {
    private String trangThai;       // CHỜ THANH TOÁN, ĐÃ THANH TOÁN, ĐÃ HỦY
    private Long soDonHang;         // Số lượng đơn hàng
    private BigDecimal tyLe;        // Tỷ lệ phần trăm
    private String moTa;            // Mô tả trạng thái

    public ThongKeTrangThaiDonHangDTO() {
    }

    public ThongKeTrangThaiDonHangDTO(String trangThai, Long soDonHang, BigDecimal tyLe, String moTa) {
        this.trangThai = trangThai;
        this.soDonHang = soDonHang;
        this.tyLe = tyLe;
        this.moTa = moTa;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public Long getSoDonHang() {
        return soDonHang;
    }

    public void setSoDonHang(Long soDonHang) {
        this.soDonHang = soDonHang;
    }

    public BigDecimal getTyLe() {
        return tyLe;
    }

    public void setTyLe(BigDecimal tyLe) {
        this.tyLe = tyLe;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }
}
