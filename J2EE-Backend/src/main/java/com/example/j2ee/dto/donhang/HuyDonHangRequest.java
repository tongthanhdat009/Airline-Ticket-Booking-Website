package com.example.j2ee.dto.donhang;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for cancelling an order
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HuyDonHangRequest {

    /**
     * Reason for order cancellation
     * Required field with minimum 10 characters and maximum 500 characters
     */
    @NotBlank(message = "Lý do hủy không được để trống")
    @Size(min = 10, max = 500, message = "Lý do hủy phải từ 10 đến 500 ký tự")
    private String lyDoHuy;
}
