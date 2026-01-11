package com.example.j2ee.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "refreshtoken")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "matoken")
    private Long maToken;

    @Column(name = "token", nullable = false, unique = true, length = 500)
    private String token;

    @Column(name = "ngaytao", nullable = false)
    private LocalDateTime ngayTao;

    @Column(name = "ngayhethan", nullable = false)
    private LocalDateTime ngayHetHan;

    @Column(name = "daxoa", nullable = false)
    private boolean daXoa = false;

    /**
     * Mối quan hệ Nhiều-Một: Token có thể thuộc về một tài khoản khách hàng
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mataikhoan")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private TaiKhoan taiKhoan;

    /**
     * Mối quan hệ Nhiều-Một: Token có thể thuộc về một tài khoản admin
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mataikhoanadmin")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private TaiKhoanAdmin taiKhoanAdmin;
}
