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
@Table(name = "hanh_dong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HanhDong {

    @Id
    @Column(name = "ma_hanh_dong", nullable = false, length = 50)
    private String maHanhDong;

    @Column(name = "mo_ta", length = 100)
    private String moTa;

    /**
     * Mối quan hệ Một-Nhiều: Một hành động có NHIỀU phân quyền
     */
    @OneToMany(mappedBy = "hanhDong", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<PhanQuyen> cacPhanQuyen;
}
