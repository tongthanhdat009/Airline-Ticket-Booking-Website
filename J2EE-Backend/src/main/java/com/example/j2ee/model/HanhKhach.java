package com.example.j2ee.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.Set;

/**
 * Lớp HanhKhach ánh xạ tới bảng 'hanhkhach' trong cơ sở dữ liệu.
 * Chứa thông tin cá nhân của một hành khách, bất kể họ có tài khoản hay không.
 */
@Entity
@Table(name = "hanhkhach")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HanhKhach {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mahanhkhach")
    private int maHanhKhach;

    @Column(name = "hovaten", length = 50)
    private String hoVaTen;

    @Column(name = "gioitinh", length = 10)
    private String gioiTinh;

    @Column(name = "ngaysinh")
    @Temporal(TemporalType.DATE)
    private Date ngaySinh;

    @Column(name = "quocgia", length = 100)
    private String quocGia;

    @Column(name = "email", unique = true, length = 100)
    private String email;

    @Column(name = "sodienthoai", unique = true, length = 20)
    private String soDienThoai;

    @Column(name = "madinhdanh", length = 50)
    private String maDinhDanh;

    @Column(name = "diachi", length = 255)
    private String diaChi;

    @OneToOne(mappedBy = "hanhKhach", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private TaiKhoan taiKhoan;

    /**
     * Mối quan hệ Một-Nhiều với DatCho.
     * Một hành khách có thể có nhiều lượt đặt chỗ.
     */
    @OneToMany(mappedBy = "hanhKhach", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<DatCho> danhSachDatCho;

}