    package com.example.j2ee.model;

import com.example.j2ee.serializer.CustomLocalTimeDeserializer;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;

@Entity
@Table(name = "chitietchuyenbay")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChiTietChuyenBay {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "machuyenbay")
        private int maChuyenBay;

        @Column(name = "sohieuchuyenbay", length = 10)
        private String soHieuChuyenBay;

    @ManyToOne(fetch = FetchType.EAGER) // EAGER để luôn lấy thông tin tuyến bay kèm theo
    @JoinColumn(name = "matuyenbay", nullable = false)
    @JsonIgnoreProperties({"chiTietChuyenBay", "giaChuyenBay"})
    private TuyenBay tuyenBay;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mamaybay")
    @JsonIgnoreProperties({"chiTietChuyenBay"})
    private MayBay mayBay;

    @Column(name = "ngaydi", nullable = false)
    private LocalDate ngayDi;

    @Column(name = "ngayden", nullable = false)
    private LocalDate ngayDen;

    @Column(name = "giodi", nullable = false)
    @JsonDeserialize(using = CustomLocalTimeDeserializer.class)
    private LocalTime gioDi;

    @Column(name = "gioden", nullable = false)
    @JsonDeserialize(using = CustomLocalTimeDeserializer.class)
    private LocalTime gioDen;

    @Column(name = "trangthai", length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'Đang mở bán'")
    private String trangThai;

    @Column(name = "thoigianden_thucte")
    private LocalDateTime thoiGianDenThucTe;

    @Column(name = "thoigiandi_thucte")
    private LocalDateTime thoiGianDiThucTe;

    @Column(name = "lydoDelay", length = 255)
    private String lyDoDelay;

    /**
     * Mối quan hệ Một-Nhiều: Một chuyến bay có nhiều ghế đã đặt
     */
    @OneToMany(mappedBy = "chuyenBay", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<GheDaDat> danhSachGheDaDat;

        @ManyToMany(fetch = FetchType.LAZY)
        @JoinTable(
                name = "dichvuchuyenbay",
                joinColumns = @JoinColumn(name = "machuyenbay"),
                inverseJoinColumns = @JoinColumn(name = "madichvu")
        )
        @JsonIgnore
        private Set<DichVuCungCap> dichVuCungCap;
    }
