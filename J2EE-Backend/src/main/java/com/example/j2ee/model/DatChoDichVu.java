package com.example.j2ee.model; // Thay đổi package cho phù hợp

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "datchodichvu")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DatChoDichVu {

    @EmbeddedId
    private DatChoDichVuId id;

    @Column(name = "soluong", nullable = false)
    private int soLuong;

    @Column(name = "dongia", nullable = false, precision = 10, scale = 2)
    private BigDecimal donGia;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("maDatCho") // Ánh xạ trường 'maDatCho' trong EmbeddedId tới mối quan hệ này
    @JoinColumn(name = "madatcho")
    @JsonIgnoreProperties({"danhSachDichVu", "trangThaiThanhToan", "hanhKhach", "chiTietGhe"})
    private DatCho datCho;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("maLuaChon") // Ánh xạ trường 'maLuaChon' trong EmbeddedId tới mối quan hệ này
    @JoinColumn(name = "maluachon")
    @JsonIgnoreProperties({"datChoDichVuSet"})
    private LuaChonDichVu luaChonDichVu;
}