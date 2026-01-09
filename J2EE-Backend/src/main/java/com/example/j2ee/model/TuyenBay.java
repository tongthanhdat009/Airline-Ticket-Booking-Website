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
@Table(name = "tuyenbay")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})

public class TuyenBay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "matuyenbay")
    private int maTuyenBay;

    /**
     * FetchType.EAGER: Khi tải một TuyenBay, luôn tải kèm thông tin SanBayDi.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "masanbaydi", nullable = false)
    @JsonIgnoreProperties({"cacTuyenBayDi", "cacTuyenBayDen"})
    private SanBay sanBayDi;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "masanbayden", nullable = false)
    @JsonIgnoreProperties({"cacTuyenBayDi", "cacTuyenBayDen"})
    private SanBay sanBayDen;

    /**
     * mappedBy trỏ đến tên thuộc tính "tuyenBay" trong lớp ChiTietChuyenBay.
     */
    @OneToMany(mappedBy = "tuyenBay", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // Ngăn việc lặp vô hạn khi chuyển đổi sang JSON
    private Set<ChiTietChuyenBay> chiTietChuyenBay;
    
    @OneToMany(mappedBy = "tuyenBay", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<GiaChuyenBay> giaChuyenBay;
}