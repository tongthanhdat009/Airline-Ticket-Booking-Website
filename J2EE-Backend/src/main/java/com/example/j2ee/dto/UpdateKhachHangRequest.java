package com.example.j2ee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO request để cập nhật thông tin khách hàng
 * Dùng cho tab "Thông tin khách hàng" trong ViewKhachHangModal
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateKhachHangRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(min = 2, max = 50, message = "Họ và tên phải từ 2 đến 50 ký tự")
    private String hoVaTen;

    private LocalDate ngaySinh;

    @Size(max = 10, message = "Giới tính tối đa 10 ký tự")
    private String gioiTinh;

    @Size(max = 255, message = "Địa chỉ tối đa 255 ký tự")
    private String diaChi;

    @Pattern(regexp = "^(0|\\+84)(3|5|7|8|9)\\d{8}$", message = "Số điện thoại không hợp lệ (0/+84 + đầu số 3/5/7/8/9 + 8 số, VD: 0987654321)")
    private String soDienThoai;

    @Size(max = 100, message = "Quốc gia tối đa 100 ký tự")
    private String quocGia;
}
