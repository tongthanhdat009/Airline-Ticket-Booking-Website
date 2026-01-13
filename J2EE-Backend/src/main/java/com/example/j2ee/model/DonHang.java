package com.example.j2ee.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "donhang")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@SQLDelete(sql = "UPDATE donhang SET da_xoa = 1, deleted_at = NOW() WHERE madonhang = ?")
@SQLRestriction("da_xoa = 0")
public class DonHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "madonhang")
    private int maDonHang;

    @Column(name = "pnr", nullable = false, unique = true, length = 6)
    private String pnr;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mahanhkhach_nguoidat", nullable = false)
    @JsonIgnoreProperties({"datCho", "taiKhoan"})
    private HanhKhach hanhKhachNguoiDat;

    @Column(name = "ngaydat", nullable = false)
    private LocalDateTime ngayDat;

    @Column(name = "tonggia", nullable = false, precision = 10, scale = 2)
    private BigDecimal tongGia = BigDecimal.ZERO;

    @Column(name = "trangthai", nullable = false, length = 50)
    private String trangThai = "CHỜ THANH TOÁN"; // CHỜ THANH TOÁN, ĐÃ THANH TOÁN, ĐÃ HỦY

    @Column(name = "email_nguoidat", nullable = false, length = 100)
    private String emailNguoiDat;

    @Column(name = "sodienthoai_nguoidat", nullable = false, length = 20)
    private String soDienThoaiNguoiDat;

    @Column(name = "ghichu", length = 500)
    private String ghiChu;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Mối quan hệ Một-Nhiều: Một đơn hàng có nhiều đặt chỗ
     */
    @OneToMany(mappedBy = "donHang", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<DatCho> danhSachDatCho;

    // ==================== SOFT DELETE FIELDS ====================
    @Column(name = "da_xoa", nullable = false)
    private Boolean daXoa = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (ngayDat == null) {
            ngayDat = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
