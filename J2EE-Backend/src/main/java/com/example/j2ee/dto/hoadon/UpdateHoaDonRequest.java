package com.example.j2ee.dto.hoadon;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO cho request cập nhật hóa đơn
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateHoaDonRequest {

    @NotNull(message = "Mã hóa đơn không được để trống")
    private Integer maHoaDon;

    private LocalDate ngayHachToan;

    private BigDecimal thueVAT;

    private String nguoiLap;

    private String ghiChu;

    private String trangThai;
}
