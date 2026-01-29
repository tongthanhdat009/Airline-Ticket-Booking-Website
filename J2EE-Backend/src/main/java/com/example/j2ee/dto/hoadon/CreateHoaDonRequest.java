package com.example.j2ee.dto.hoadon;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO cho request tạo hóa đơn mới
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateHoaDonRequest {

    @NotNull(message = "Mã đơn hàng không được để trống")
    private Integer maDonHang;

    @NotBlank(message = "Số hóa đơn không được để trống")
    private String soHoaDon;

    @NotNull(message = "Ngày hạch toán không được để trống")
    private LocalDate ngayHachToan;

    @NotNull(message = "Tổng tiền không được để trống")
    @Positive(message = "Tổng tiền phải lớn hơn 0")
    private BigDecimal tongTien;

    private BigDecimal thueVAT = BigDecimal.ZERO;

    private String nguoiLap;

    private String ghiChu;
}
