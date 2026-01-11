package com.example.j2ee.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "sanbay")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SanBay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "masanbay")
    private int maSanBay;

    @Column(name = "ma_iata", length = 3, unique = true)
    private String maIATA;

    @Column(name = "ma_icao", length = 4)
    private String maICAO;

    @Column(name = "tensanbay", nullable = false)
    private String tenSanBay;

    @Column(name = "thanhphosanbay")
    private String thanhPhoSanBay;

    @Column(name = "quocgiasanbay")
    private String quocGiaSanBay;

    @Column(name = "trangthaihoatdong")
    private String trangThaiHoatDong; //INACTIVE hoặc ACTIVE
    /**
     * Mối quan hệ Một-Nhiều: Một sân bay là điểm ĐI của NHIỀU tuyến bay.
     * mappedBy trỏ đến thuộc tính "sanBayDi" trong lớp TuyenBay.
     */
    @OneToMany(mappedBy = "sanBayDi", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<TuyenBay> cacTuyenBayDi;

    /**
     * Mối quan hệ Một-Nhiều: Một sân bay là điểm ĐẾN của NHIỀU tuyến bay.
     * mappedBy trỏ đến thuộc tính "sanBayDen" trong lớp TuyenBay.
     */
    @OneToMany(mappedBy = "sanBayDen", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<TuyenBay> cacTuyenBayDen;
}
