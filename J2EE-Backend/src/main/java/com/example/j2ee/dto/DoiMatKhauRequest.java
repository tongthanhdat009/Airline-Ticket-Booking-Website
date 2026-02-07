package com.example.j2ee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO request để đổi mật khẩu khách hàng (admin thực hiện)
 * Dùng cho tab "Tài khoản" trong ViewKhachHangModal
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoiMatKhauRequest {

    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 6, max = 50, message = "Mật khẩu phải từ 6 đến 50 ký tự")
    private String matKhauMoi;
}
