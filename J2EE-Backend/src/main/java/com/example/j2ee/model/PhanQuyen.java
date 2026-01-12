package com.example.j2ee.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "phan_quyen", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"ma_vai_tro", "ma_chuc_nang", "ma_hanh_dong"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PhanQuyen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "ma_vai_tro", nullable = false)
    private int maVaiTro;

    @Column(name = "ma_chuc_nang", nullable = false)
    private int maChucNang;

    @Column(name = "ma_hanh_dong", nullable = false, length = 50)
    private String maHanhDong;

    /**
     * Mối quan hệ Nhiều-Một: NHIỀU phân quyền thuộc về MỘT vai trò
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_vai_tro", insertable = false, updatable = false)
    @JsonIgnore
    private VaiTro vaiTro;

    /**
     * Mối quan hệ Nhiều-Một: NHIỀU phân quyền thuộc về MỘT chức năng
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_chuc_nang", insertable = false, updatable = false)
    @JsonIgnore
    private ChucNang chucNang;

    /**
     * Mối quan hệ Nhiều-Một: NHIỀU phân quyền thuộc về MỘT hành động
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_hanh_dong", insertable = false, updatable = false)
    @JsonIgnore
    private HanhDong hanhDong;
}
