package com.example.j2ee.dto.donhang;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Request DTO for updating order status
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTrangThaiDonHangRequest {

    /**
     * New order status
     * Valid values: CHỜ THANH TOÁN, ĐÃ THANH TOÁN, ĐÃ HỦY
     */
    @NotBlank(message = "Trạng thái không được để trống")
    @Pattern(regexp = "^(CHỜ THANH TOÁN|ĐÃ THANH TOÁN|ĐÃ HỦY)$",
             message = "Trạng thái phải là một trong các giá trị: CHỜ THANH TOÁN, ĐÃ THANH TOÁN, ĐÃ HỦY")
    private String trangThai;
}
