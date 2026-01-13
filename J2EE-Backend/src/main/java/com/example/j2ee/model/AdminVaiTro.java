package com.example.j2ee.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "admin_vai_tro")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AdminVaiTro {

    @EmbeddedId
    private AdminVaiTroId id;

    /**
     * Mối quan hệ Nhiều-Một: NHIỀU admin_vai_tro thuộc về MỘT admin
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mataikhoan", insertable = false, updatable = false)
    @JsonIgnore
    private TaiKhoanAdmin taiKhoanAdmin;

    /**
     * Mối quan hệ Nhiều-Một: NHIỀU admin_vai_tro thuộc về MỘT vai trò
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ma_vai_tro", insertable = false, updatable = false)
    @JsonIgnore
    private VaiTro vaiTro;
}
