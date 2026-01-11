package com.example.j2ee.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_log")
    private Long maLog;

    @Column(name = "loai_thao_tac", nullable = false, length = 50)
    private String loaiThaoTac; // HỦY VÉ, ĐỔI GIỜ BAY, ĐỔI CHUYẾN BAY, CHECK-IN, HOÀN TIỀN, etc.

    @Column(name = "bang_anh_huong", nullable = false, length = 50)
    private String bangAnhHuong; // datcho, chitietchuyenbay, etc.

    @Column(name = "ma_ban_ghi", nullable = false)
    private int maBanGhi; // ID của bản ghi bị ảnh hưởng

    @Column(name = "nguoi_thuc_hien", nullable = false, length = 100)
    private String nguoiThucHien; // Email hoặc tên người thực hiện

    @Column(name = "loai_tai_khoan", nullable = false, length = 20)
    private String loaiTaiKhoan; // ADMIN, CUSTOMER

    @Column(name = "du_lieu_cu", columnDefinition = "TEXT")
    private String duLieuCu; // Dữ liệu trước khi thay đổi (JSON)

    @Column(name = "du_lieu_moi", columnDefinition = "TEXT")
    private String duLieuMoi; // Dữ liệu sau khi thay đổi (JSON)

    @Column(name = "mo_ta", length = 500)
    private String moTa; // Mô tả chi tiết

    @Column(name = "dia_chi_ip", length = 45)
    private String diaChiIp; // IP của người thực hiện

    @Column(name = "thoi_gian", nullable = false)
    private LocalDateTime thoiGian;
}
