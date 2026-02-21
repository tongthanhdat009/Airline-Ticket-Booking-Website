package com.example.j2ee.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * DTO để trả về thông tin tài khoản cho client
 * KHÔNG bao gồm các thông tin nhạy cảm như:
 * - matKhauBam (hashed password)
 * - oauth2Provider
 * - oauth2Id
 * - refreshToken
 *
 * Giữ cấu trúc nested hanhKhach để compatible với frontend hiện tại
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaiKhoanDTO {
    // Thông tin tài khoản
    private Integer maTaiKhoan;
    private String email;
    private Date ngayTao;
    private String trangThai;
    private boolean emailVerified;

    // Nested object để compatible với frontend
    private HanhKhachNested hanhKhach;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HanhKhachNested {
        private Integer maHanhKhach;
        private String hoVaTen;
        private String gioiTinh;
        private Date ngaySinh;
        private String soDienThoai;
        private String maDinhDanh;
        private String diaChi;
        private String quocGia;
        private String email;
    }
}
