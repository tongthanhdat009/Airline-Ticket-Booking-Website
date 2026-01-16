package com.example.j2ee.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "maybay")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@SQLDelete(sql = "UPDATE maybay SET da_xoa = 1, deleted_at = NOW(), sohieu = CONCAT(sohieu, '_deleted_', mamaybay) WHERE mamaybay = ?")
@SQLRestriction("da_xoa = 0")
public class MayBay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mamaybay")
    private int maMayBay;

    @Column(name = "tenmaybay", nullable = false)
    private String tenMayBay;

    @Column(name = "hangmaybay", nullable = false, length = 100)
    private String hangMayBay;

    @Column(name = "loaimaybay", nullable = false, length = 100)
    private String loaiMayBay;

    @Column(name = "sohieu", nullable = false, unique = true, length = 50)
    private String soHieu;

    @Column(name = "tongsoghe", nullable = false)
    private int tongSoGhe;

    @Column(name = "trangthai", length = 50)
    private String trangThai = "Hoạt động";

    @Column(name = "namkhaithac")
    private Integer namKhaiThac;

    /**
     * Mối quan hệ Một-Nhiều: Một máy bay có thể thực hiện nhiều chuyến bay.
     */
    @OneToMany(mappedBy = "mayBay", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<ChiTietChuyenBay> chiTietChuyenBay;

    /**
     * Mối quan hệ Một-Nhiều: Một máy bay có sơ đồ ghế (nhiều ghế)
     */
    @OneToMany(mappedBy = "mayBay", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<ChiTietGhe> danhSachGhe;

    // ==================== SOFT DELETE FIELDS ====================
    @Column(name = "da_xoa", nullable = false)
    private Boolean daXoa = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
