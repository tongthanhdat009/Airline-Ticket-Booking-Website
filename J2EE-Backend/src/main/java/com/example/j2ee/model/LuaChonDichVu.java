package com.example.j2ee.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Set;

@Entity
@Table(name = "luachondichvu")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LuaChonDichVu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maluachon")
    private int maLuaChon;

    @Column(name = "tenluachon", nullable = false, length = 100)
    private String tenLuaChon;

    @Column(name = "mota")
    private String moTa;

    @Column(name = "gia", nullable = false, precision = 10, scale = 2)
    private BigDecimal gia;

    @Column(name = "anh")
    private String anh;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "madichvu", referencedColumnName = "madichvu")
    @JsonIgnoreProperties({"cacLuaChon", "chuyenBayCungCap"})
    private DichVuCungCap dichVuCungCap;

    @OneToMany(mappedBy = "luaChonDichVu", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<DatChoDichVu> datChoDichVuSet;
}