package com.example.j2ee.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity HoaDon - Hóa đơn
 */
@Entity
@Table(name = "hoadon")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@SQLDelete(sql = "UPDATE hoadon SET da_xoa = 1, deleted_at = NOW() WHERE mahoadon = ?")
@SQLRestriction("da_xoa = 0")
public class HoaDon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mahoadon")
    private int maHoaDon;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "madonhang", nullable = false, referencedColumnName = "madonhang")
    @JsonIgnoreProperties({"hanhKhachNguoiDat", "danhSachDatCho", "khuyenMaiSuDung"})
    private DonHang donHang;

    @Column(name = "sohoadon", nullable = false, unique = true, length = 50)
    private String soHoaDon;

    @Column(name = "ngaylap", nullable = false)
    private LocalDateTime ngayLap;

    @Column(name = "ngayhachtoan", nullable = false)
    private LocalDate ngayHachToan;

    @Column(name = "tongtien", nullable = false, precision = 10, scale = 2)
    private BigDecimal tongTien;

    @Column(name = "thuevat", precision = 10, scale = 2)
    private BigDecimal thueVAT = BigDecimal.ZERO;

    @Column(name = "tongthanhtoan", nullable = false, precision = 10, scale = 2)
    private BigDecimal tongThanhToan;

    @Column(name = "trangthai", nullable = false, length = 30)
    private String trangThai = "DA_PHAT_HANH"; // DA_PHAT_HANH, DA_HUY, DIEU_CHINH

    @Column(name = "nguoi_lap", length = 100)
    private String nguoiLap;

    @Column(name = "ghi_chu", length = 500)
    private String ghiChu;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (ngayLap == null) {
            ngayLap = LocalDateTime.now();
        }
        if (ngayHachToan == null) {
            ngayHachToan = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isDaPhatHanh() {
        return "DA_PHAT_HANH".equals(trangThai);
    }

    public boolean isDaHuy() {
        return "DA_HUY".equals(trangThai);
    }

    public boolean isDieuChinh() {
        return "DIEU_CHINH".equals(trangThai);
    }

    // ==================== SOFT DELETE FIELDS ====================
    @Column(name = "da_xoa", nullable = false)
    private Boolean daXoa = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
