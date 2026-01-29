package com.example.j2ee.dto.hoadon;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho request hủy hóa đơn
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HuyHoaDonRequest {

    @NotNull(message = "Mã hóa đơn không được để trống")
    private Integer maHoaDon;

    @NotBlank(message = "Lý do hủy không được để trống")
    private String lyDoHuy;

    private String nguoiThucHien;
}
