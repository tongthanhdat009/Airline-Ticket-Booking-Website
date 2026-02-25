package com.example.j2ee.dto.khuyenmai;

import lombok.Data;

import java.math.BigDecimal;

/**
 * Response kiểm tra mã khuyến mãi
 */
@Data
public class ValidateCouponResponse {

    private boolean valid;

    private String tenKhuyenMai;

    private String loaiKhuyenMai; // PERCENT or FIXED

    private BigDecimal giaTriGiam; // Tổng giá trị giảm

    private BigDecimal tongGiaSauKM; // Tổng giá sau khi áp dụng

    private String moTa; // Mô tả khuyến mãi

    private String message; // Thông báo lỗi (nếu không hợp lệ)
}
