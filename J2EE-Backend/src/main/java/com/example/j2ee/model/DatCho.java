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
@Table(name = "datcho")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DatCho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "madatcho")
    private int maDatCho;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "madonhang", nullable = false)
    @JsonIgnoreProperties({"danhSachDatCho"})
    private DonHang donHang;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mahanhkhach", nullable = false)
    @JsonIgnoreProperties({"datCho", "taiKhoan"})
    private HanhKhach hanhKhach;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "machuyenbay", nullable = false)
    @JsonIgnoreProperties({"danhSachGhe", "dichVuCungCap"})
    private ChiTietChuyenBay chuyenBay;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mahangve", nullable = false)
    @JsonIgnoreProperties({"giaChuyenBay", "chiTietGhe"})
    private HangVe hangVe;

    @Column(name = "giave", nullable = false, precision = 10, scale = 2)
    private BigDecimal giaVe;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maghe_da_chon", referencedColumnName = "maghe")
    @JsonIgnoreProperties({"datCho", "chuyenBay", "hangVe"})
    private ChiTietGhe chiTietGhe;

    @Column(name = "ngaydatcho", nullable = false)
    private LocalDateTime ngayDatCho;

    @Column(name = "trangthai", nullable = false, length = 50)
    private String trangThai = "ACTIVE"; // ACTIVE, CANCELLED

    @Column(name = "checkin_status", nullable = false)
    private boolean checkInStatus = false;

    @Column(name = "checkin_time")
    private LocalDateTime checkInTime;

    @OneToOne(mappedBy = "datCho", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private TrangThaiThanhToan trangThaiThanhToan;

    @OneToMany(mappedBy = "datCho", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"datCho"})
    private Set<DatChoDichVu> danhSachDichVu;

    /**
     * Mối quan hệ Một-Nhiều: Một đặt chỗ có thể sử dụng nhiều khuyến mãi
     */
    @OneToMany(mappedBy = "datCho", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<KhuyenMaiDatCho> danhSachKhuyenMai;
}
