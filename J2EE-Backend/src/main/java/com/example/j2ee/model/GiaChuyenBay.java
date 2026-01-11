package com.example.j2ee.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "giachuyenbay")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class GiaChuyenBay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "magia")
    private int maGia;

    // Mối quan hệ Nhiều-Một: Nhiều mức giá có thể áp dụng cho cùng 1 tuyến bay
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matuyenbay", nullable = false)
    @JsonIgnoreProperties({"giaChuyenBay", "chiTietChuyenBay"})
    private TuyenBay tuyenBay;

    // Mối quan hệ Nhiều-Một: Nhiều mức giá có thể áp dụng cho cùng 1 hạng vé
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mahangve", nullable = false)
    @JsonIgnoreProperties({"giaChuyenBay", "chiTietGhe"})
    private HangVe hangVe;

    @Column(name = "giave", nullable = false, precision = 10, scale = 2)
    private BigDecimal giaVe;

    @Column(name = "soluong_phanbo", nullable = false)
    private Integer soLuongPhanBo = 0; // Số ghế phân bổ cho mức giá này

    @Column(name = "soluong_daban", nullable = false)
    private Integer soLuongDaBan = 0; // Số ghế đã bán với mức giá này

    @Column(name = "ngayapdungtu", nullable = false)
    private LocalDate ngayApDungTu;

    @Column(name = "ngayapdungden")
    private LocalDate ngayApDungDen; // Có thể là null, nghĩa là áp dụng vô thời hạn
}
