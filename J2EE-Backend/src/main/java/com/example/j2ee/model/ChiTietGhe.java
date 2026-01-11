package com.example.j2ee.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "chitietghe")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChiTietGhe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maghe")
    private int maGhe;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mamaybay", nullable = false)
    @JsonIgnoreProperties({"chiTietGhe"})
    private MayBay mayBay;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mahangve", nullable = false)
    @JsonIgnoreProperties({"giaChuyenBay", "chiTietGhe"})
    private HangVe hangVe;

    @Column(name = "soghe", nullable = false, length = 10)
    private String soGhe;

    @Column(name = "vitrighe", length = 20)
    private String viTriGhe; // CỬA SỔ, LỐI ĐI, GIỮA

    @Column(name = "hang")
    private Integer hang; // Số hàng

    @Column(name = "cot", length = 2)
    private String cot; // Cột (A, B, C, D, E, F)

    /**
     * Mối quan hệ Một-Nhiều: Một ghế có thể được đặt trong nhiều ghe_da_dat
     */
    @OneToMany(mappedBy = "ghe", fetch = FetchType.LAZY)
    @JsonIgnore
    private java.util.Set<GheDaDat> danhSachGheDaDat;
}
