package com.example.j2ee.dto;

import java.math.BigDecimal;

/**
 * DTO cho thống kê so sánh cùng kỳ (Grouped Bar Chart)
 * So sánh tháng này với tháng trước, hoặc năm nay với năm trước
 */
public class ThongKeSoSanhCungKyDTO {
    private String ky;              // Tên kỳ (Tháng này, Tháng trước, Năm nay, Năm trước)
    private BigDecimal doanhThu;    // Doanh thu
    private Long soVe;              // Số lượng vé
    private Long soDonHang;         // Số đơn hàng

    public ThongKeSoSanhCungKyDTO() {
    }

    public ThongKeSoSanhCungKyDTO(String ky, BigDecimal doanhThu, Long soVe, Long soDonHang) {
        this.ky = ky;
        this.doanhThu = doanhThu;
        this.soVe = soVe;
        this.soDonHang = soDonHang;
    }

    public String getKy() {
        return ky;
    }

    public void setKy(String ky) {
        this.ky = ky;
    }

    public BigDecimal getDoanhThu() {
        return doanhThu;
    }

    public void setDoanhThu(BigDecimal doanhThu) {
        this.doanhThu = doanhThu;
    }

    public Long getSoVe() {
        return soVe;
    }

    public void setSoVe(Long soVe) {
        this.soVe = soVe;
    }

    public Long getSoDonHang() {
        return soDonHang;
    }

    public void setSoDonHang(Long soDonHang) {
        this.soDonHang = soDonHang;
    }
}
