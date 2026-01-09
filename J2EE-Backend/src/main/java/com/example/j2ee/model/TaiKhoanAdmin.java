package com.example.j2ee.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "taikhoanadmin")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaiKhoanAdmin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mataikhoan")
    private int maTaiKhoan;

    @Column(name = "tendangnhap", nullable = false, unique = true, length = 50)
    private String tenDangNhap;

    @Column(name = "matkhaubam", nullable = false, length = 255)
    private String matKhauBam;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "hovaten", length = 100)
    private String hoVaTen;

    @Column(name = "ngaytao", nullable = false)
    private LocalDateTime ngayTao;
}
