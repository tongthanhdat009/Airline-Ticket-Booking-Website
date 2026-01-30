package com.example.j2ee.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cho thống kê so sánh theo kỳ
 * Dùng cho endpoint /thongke/so-sanh
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ThongKeSoSanhDTO {

    /** Doanh thu kỳ hiện tại */
    private BigDecimal doanhThuHienTai;

    /** Doanh thu kỳ trước */
    private BigDecimal doanhThuTruoc;

    /** Phần trăm thay đổi doanh thu */
    private BigDecimal phanTramThayDoiDoanhThu;

    /** Số lượng vé bán kỳ hiện tại */
    private Long soLuongVeHienTai;

    /** Số lượng vé bán kỳ trước */
    private Long soLuongVeTruoc;

    /** Phần trăm thay đổi số lượng vé */
    private BigDecimal phanTramThayDoiSoLuongVe;

    /** Số đơn hàng kỳ hiện tại */
    private Long soDonHangHienTai;

    /** Số đơn hàng kỳ trước */
    private Long soDonHangTruoc;

    /** Phần trăm thay đổi số đơn hàng */
    private BigDecimal phanTramThayDoiSoDonHang;

    /** Kỳ so sánh (WEEK, MONTH, YEAR) */
    private String kyTruoc;
}
