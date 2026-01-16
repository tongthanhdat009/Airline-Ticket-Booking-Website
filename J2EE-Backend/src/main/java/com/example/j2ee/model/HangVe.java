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