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

    // Nhiều ghế thuộc về một chuyến bay chi tiết
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "machuyenbay")
    @JsonIgnoreProperties({"danhSachGhe", "dichVuCungCap"})
    private ChiTietChuyenBay chiTietChuyenBay;

    // Nhiều ghế thuộc cùng một hạng vé
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mahangve")
    @JsonIgnoreProperties({"giaChuyenBay", "chiTietGhe"})
    private HangVe hangVe;

    // Một ghế chỉ có thể được đặt bởi một lần đặt chỗ
    @OneToOne(mappedBy = "chiTietGhe", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private DatCho datCho;
}