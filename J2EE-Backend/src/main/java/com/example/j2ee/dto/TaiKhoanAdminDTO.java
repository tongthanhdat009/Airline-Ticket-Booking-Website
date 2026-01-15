package com.example.j2ee.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO để trả về thông tin tài khoản admin kèm vai trò
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaiKhoanAdminDTO {
    private int maTaiKhoan;
    private String tenDangNhap;
    private String email;
    private String hoVaTen;
    private LocalDateTime ngayTao;
    private List<Integer> vaiTro;      // Danh sách mã vai trò
    private List<String> tenVaiTro;    // Danh sách tên vai trò
}
