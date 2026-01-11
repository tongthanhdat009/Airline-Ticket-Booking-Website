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
@Table(name = "ghe_da_dat")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class GheDaDat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_ghe_da_dat")
    private int maGheDaDat;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "machuyenbay", nullable = false)
    @JsonIgnoreProperties({"danhSachGhe", "dichVuCungCap"})
    private ChiTietChuyenBay chuyenBay;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "maghe", nullable = false)
    @JsonIgnoreProperties({"datCho", "chuyenBay", "hangVe"})
    private ChiTietGhe ghe;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "madatcho", nullable = false)
    @JsonIgnoreProperties({"chiTietGhe", "chuyenBay", "hanhKhach", "hangVe", "trangThaiThanhToan", "danhSachDichVu"})
    private DatCho datCho;

    @Column(name = "thoigian_dat", nullable = false)
    private LocalDateTime thoiGianDat;
}
