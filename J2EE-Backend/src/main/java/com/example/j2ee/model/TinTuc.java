package com.example.j2ee.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Entity
@Table(name = "tin_tuc")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@SQLDelete(sql = "UPDATE tin_tuc SET da_xoa = 1, deleted_at = NOW() WHERE matintuc = ?")
@SQLRestriction("da_xoa = 0")
public class TinTuc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "matintuc")
    private int maTinTuc;

    @Column(name = "tieu_de", nullable = false, length = 255)
    private String tieuDe;

    @Column(name = "tom_tat", columnDefinition = "TEXT")
    private String tomTat;

    @Column(name = "noi_dung", columnDefinition = "LONGTEXT")
    private String noiDung;

    @Column(name = "hinh_anh", length = 500)
    private String hinhAnh;

    @Column(name = "danh_muc", length = 100)
    private String danhMuc;

    @Column(name = "trang_thai", length = 50)
    private String trangThai;

    @Column(name = "ngay_dang")
    private LocalDateTime ngayDang;

    @Column(name = "luot_xem")
    private Integer luotXem = 0;

    @Column(name = "tac_gia", length = 100)
    private String tacGia;

    @Column(name = "ngay_tao", nullable = false, updatable = false)
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;

    // ==================== SOFT DELETE FIELDS ====================
    @Column(name = "da_xoa", nullable = false)
    private Boolean daXoa = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // ==================== LIFECYCLE CALLBACKS ====================
    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
        ngayCapNhat = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        ngayCapNhat = LocalDateTime.now();
    }
}
