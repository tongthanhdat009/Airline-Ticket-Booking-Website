package com.example.j2ee.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO để trả về thông tin tài khoản của khách hàng
 * Dùng cho tab "Tài khoản" trong ViewKhachHangModal
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaiKhoanKhachHangDTO {
    private String email;
    private String trangThai;           // "HOAT_DONG" | "BI_KHOA"
    private LocalDateTime ngayTao;
    private String phuongThucDangNhap;  // "EMAIL" | "GOOGLE" | null
    private Boolean daXacThucEmail;
}
