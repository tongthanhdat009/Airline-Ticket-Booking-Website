package com.example.j2ee.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "taikhoanadmin")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SQLDelete(sql = "UPDATE taikhoanadmin SET da_xoa = 1, deleted_at = NOW() WHERE mataikhoan = ?")
@SQLRestriction("da_xoa = 0")
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

    // ==================== SOFT DELETE FIELDS ====================
    @Column(name = "da_xoa", nullable = false)
    private Boolean daXoa = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // ==================== RELATIONSHIPS ====================
    /**
     * Mối quan hệ Một-Nhiều: Một admin có NHIỀU vai trò
     */
    @OneToMany(mappedBy = "taiKhoanAdmin", fetch = FetchType.EAGER)
    @JsonIgnore
    private Set<AdminVaiTro> cacVaiTro;
}
