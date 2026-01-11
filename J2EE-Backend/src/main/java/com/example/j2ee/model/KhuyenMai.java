package com.example.j2ee.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "khuyenmai")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class KhuyenMai {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "makhuyenmai")
    private int maKhuyenMai;

    @Column(name = "makm", nullable = false, unique = true, length = 20)
    private String maKM;

    @Column(name = "tenkhuyenmai", nullable = false, length = 255)
    private String tenKhuyenMai;

    @Column(name = "mota", length = 500)
    private String moTa;

    @Column(name = "loaikhuyenmai", nullable = false, length = 50)
    private String loaiKhuyenMai; // PERCENT hoặc FIXED

    @Column(name = "giatrigiam", nullable = false, precision = 10, scale = 2)
    private BigDecimal giaTriGiam;

    @Column(name = "giatritoithieu", precision = 10, scale = 2)
    private BigDecimal giaTriToiThieu;

    @Column(name = "giatritoida", precision = 10, scale = 2)
    private BigDecimal giaTriToiDa;

    @Column(name = "soluong")
    private Integer soLuong;

    @Column(name = "soluongdaduocdung")
    private Integer soLuongDaDuocDung = 0;

    @Column(name = "ngaybatdau", nullable = false)
    private LocalDateTime ngayBatDau;

    @Column(name = "ngayketthuc", nullable = false)
    private LocalDateTime ngayKetThuc;

    @Column(name = "trangthai", nullable = false, length = 20)
    private String trangThai = "ACTIVE"; // ACTIVE, INACTIVE, EXPIRED

    @Column(name = "ngaytao", nullable = false)
    private LocalDateTime ngayTao;

    /**
     * Mối quan hệ Một-Nhiều: Một khuyến mãi có thể được sử dụng trong nhiều đặt chỗ
     */
    @OneToMany(mappedBy = "khuyenMai", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<KhuyenMaiDatCho> danhSachDatCho;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(ngayKetThuc);
    }

    public boolean isActive() {
        LocalDateTime now = LocalDateTime.now();
        return "ACTIVE".equals(trangThai) 
                && !now.isBefore(ngayBatDau) 
                && !now.isAfter(ngayKetThuc)
                && (soLuong == null || soLuongDaDuocDung < soLuong);
    }

    public boolean canUse() {
        return isActive() && (soLuong == null || soLuongDaDuocDung < soLuong);
    }
}
