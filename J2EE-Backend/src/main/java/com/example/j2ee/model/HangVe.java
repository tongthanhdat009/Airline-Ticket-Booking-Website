package com.example.j2ee.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "hangve")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@SQLDelete(sql = "UPDATE hangve SET da_xoa = 1, deleted_at = NOW(), tenhangve = CONCAT(tenhangve, '_deleted_', mahangve) WHERE mahangve = ?")
@SQLRestriction("da_xoa = 0")
public class HangVe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mahangve")
    private int maHangVe;

    @Column(name = "tenhangve", nullable = false, unique = true)
    private String tenHangVe;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    // ==================== UI COLOR FIELDS ====================
    @Column(name = "mau_nen", length = 100)
    private String mauNen;

    @Column(name = "mau_vien", length = 100)
    private String mauVien;

    @Column(name = "mau_chu", length = 100)
    private String mauChu;

    @Column(name = "mau_header", length = 200)
    private String mauHeader;

    @Column(name = "mau_icon", length = 100)
    private String mauIcon;

    @Column(name = "mau_ring", length = 100)
    private String mauRing;

    @Column(name = "mau_badge", length = 100)
    private String mauBadge;

    @Column(name = "hang_bac", length = 20)
    private String hangBac;

    @OneToMany(mappedBy = "hangVe", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<GiaChuyenBay> giaChuyenBay;

    @OneToMany(mappedBy = "hangVe", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<ChiTietGhe> chiTietGhe;

    // ==================== SOFT DELETE FIELDS ====================
    @Column(name = "da_xoa", nullable = false)
    private Boolean daXoa = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}