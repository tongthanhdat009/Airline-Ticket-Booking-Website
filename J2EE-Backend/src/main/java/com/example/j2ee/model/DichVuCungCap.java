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
@Table(name = "dichvucungcap")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@SQLDelete(sql = "UPDATE dichvucungcap SET da_xoa = 1, deleted_at = NOW() WHERE madichvu = ?")
@SQLRestriction("da_xoa = 0")
public class DichVuCungCap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "madichvu")
    private int maDichVu;

    @Column(name = "tendichvu", nullable = false, length = 100)
    private String tenDichVu;

    @Column(name = "mota")
    private String moTa;

    @Column(name = "anh")
    private String anh;

    @OneToMany(mappedBy = "dichVuCungCap", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<LuaChonDichVu> cacLuaChon;

    @ManyToMany(mappedBy = "dichVuCungCap", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<ChiTietChuyenBay> chuyenBayCungCap;

    // ==================== SOFT DELETE FIELDS ====================
    @Column(name = "da_xoa", nullable = false)
    private Boolean daXoa = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}