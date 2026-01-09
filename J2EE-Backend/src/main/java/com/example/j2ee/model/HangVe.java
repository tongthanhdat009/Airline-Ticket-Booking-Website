package com.example.j2ee.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "hangve")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HangVe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mahangve")
    private int maHangVe;

    @Column(name = "tenhangve", nullable = false, unique = true)
    private String tenHangVe;

    @Column(name = "succhua", nullable = false)
    private int sucChua;

    @OneToMany(mappedBy = "hangVe", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<GiaChuyenBay> giaChuyenBay;

    @OneToMany(mappedBy = "hangVe", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<ChiTietGhe> chiTietGhe;
}