package com.example.j2ee.model; // Thay đổi package cho phù hợp

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "taikhoan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SQLDelete(sql = "UPDATE taikhoan SET da_xoa = 1, deleted_at = NOW() WHERE mataikhoan = ?")
@SQLRestriction("da_xoa = 0")
public class TaiKhoan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mataikhoan")
    private int maTaiKhoan;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @JsonIgnore
    @Column(name = "matkhaubam", nullable = false, length = 255)
    private String matKhauBam;

    @Column(name = "ngaytao", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date ngayTao;

    @Column(name = "trangthai", nullable = false, length = 20)
    private String trangThai;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @Column(name = "oauth2_provider", length = 20)
    private String oauth2Provider; // GOOGLE, FACEBOOK, null for normal accounts

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mahanhkhach", referencedColumnName = "mahanhkhach", nullable = false, unique = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private HanhKhach hanhKhach;

    // ==================== SOFT DELETE FIELDS ====================
    @Column(name = "da_xoa", nullable = false)
    private Boolean daXoa = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
