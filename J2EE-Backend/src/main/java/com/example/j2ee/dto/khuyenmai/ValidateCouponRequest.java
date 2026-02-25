package com.example.j2ee.dto.khuyenmai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Request kiểm tra mã khuyến mãi trước khi thanh toán
 */
@Data
public class ValidateCouponRequest {

    @NotBlank(message = "Mã khuyến mãi không được để trống")
    private String maKM;

    @NotNull(message = "Tổng giá đơn hàng không được để trống")
    @Positive(message = "Tổng giá đơn hàng phải lớn hơn 0")
    private BigDecimal tongGiaDonHang;

    @NotNull(message = "Số lượng vé không được để trống")
    @Positive(message = "Số lượng vé phải lớn hơn 0")
    private Integer soLuongVe;
}
