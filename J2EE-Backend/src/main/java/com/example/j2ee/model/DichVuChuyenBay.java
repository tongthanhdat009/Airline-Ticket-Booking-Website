package com.example.j2ee.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Lớp DichVuChuyenBay ánh xạ tới bảng 'dichvuchuyenbay'.
 * Là bảng liên kết Nhiều-Nhiều giữa ChiTietChuyenBay và DichVuCungCap.
 */
@Entity
@Table(name = "dichvuchuyenbay")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DichVuChuyenBay {

    @EmbeddedId
    private DichVuChuyenBayId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("maChuyenBay")
    @JoinColumn(name = "machuyenbay")
    private ChiTietChuyenBay chiTietChuyenBay;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("maDichVu")
    @JoinColumn(name = "madichvu")
    private DichVuCungCap dichVuCungCap;
    
}