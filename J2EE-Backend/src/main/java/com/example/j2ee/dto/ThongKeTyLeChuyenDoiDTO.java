package com.example.j2ee.dto;

import java.math.BigDecimal;

/**
 * DTO cho thống kê tỷ lệ chuyển đổi đặt vé (Funnel Chart)
 * Theo dõi từ Truy cập -> Tìm kiếm -> Điền thông tin -> Thanh toán thành công
 */
public class ThongKeTyLeChuyenDoiDTO {
    private String buoc;            // Tên bước (Truy cập, Tìm kiếm, Điền thông tin, Thanh toán)
    private Long soLuong;           // Số lượng
    private BigDecimal tyLe;        // Tỷ lệ phần trăm
    private Integer thuTu;          // Thứ tự của bước

    public ThongKeTyLeChuyenDoiDTO() {
    }

    public ThongKeTyLeChuyenDoiDTO(String buoc, Long soLuong, BigDecimal tyLe, Integer thuTu) {
        this.buoc = buoc;
        this.soLuong = soLuong;
        this.tyLe = tyLe;
        this.thuTu = thuTu;
    }

    public String getBuoc() {
        return buoc;
    }

    public void setBuoc(String buoc) {
        this.buoc = buoc;
    }

    public Long getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Long soLuong) {
        this.soLuong = soLuong;
    }

    public BigDecimal getTyLe() {
        return tyLe;
    }

    public void setTyLe(BigDecimal tyLe) {
        this.tyLe = tyLe;
    }

    public Integer getThuTu() {
        return thuTu;
    }

    public void setThuTu(Integer thuTu) {
        this.thuTu = thuTu;
    }
}
