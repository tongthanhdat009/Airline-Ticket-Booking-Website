package com.example.j2ee.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "khuyenmai_datcho")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class KhuyenMaiDatCho {

    @EmbeddedId
    private KhuyenMaiDatChoId id;

    @Column(name = "sotiengiam", nullable = false, precision = 10, scale = 2)
    private BigDecimal soTienGiam;

    @Column(name = "ngaysudung", nullable = false)
    private LocalDateTime ngaySuDung;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("maKhuyenMai")
    @JoinColumn(name = "makhuyenmai")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private KhuyenMai khuyenMai;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("maDatCho")
    @JoinColumn(name = "madatcho")
    @JsonIgnoreProperties({"hanhKhach", "chiTietGhe", "trangThaiThanhToan", "danhSachDichVu"})
    private DatCho datCho;

    @PrePersist
    protected void onCreate() {
        if (ngaySuDung == null) {
            ngaySuDung = LocalDateTime.now();
        }
    }
}
