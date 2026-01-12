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
@Table(name = "chuc_nang")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChucNang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_chuc_nang")
    private int maChucNang;

    @Column(name = "ma_code", nullable = false, unique = true, length = 50)
    private String maCode;

    @Column(name = "ten_chuc_nang", nullable = false, length = 100)
    private String tenChucNang;

    @Column(name = "nhom", length = 50)
    private String nhom;

    /**
     * Mối quan hệ Một-Nhiều: Một chức năng có NHIỀU phân quyền
     */
    @OneToMany(mappedBy = "chucNang", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<PhanQuyen> cacPhanQuyen;
}
