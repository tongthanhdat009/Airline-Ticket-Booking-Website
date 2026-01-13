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

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "hoantien")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@SQLDelete(sql = "UPDATE hoantien SET da_xoa = 1, deleted_at = NOW() WHERE mahp = ?")
@SQLRestriction("da_xoa = 0")
public class HoanTien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mahp")
    private int maHP;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "madatcho", nullable = false, referencedColumnName = "madatcho")
    @JsonIgnoreProperties({"hanhKhach", "chiTietGhe", "trangThaiThanhToan", "danhSachDichVu"})
    private DatCho datCho;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mathanhtoan", nullable = false, referencedColumnName = "mathanhtoan")
    @JsonIgnoreProperties({"datCho"})
    private TrangThaiThanhToan trangThaiThanhToan;

    @Column(name = "sotienhoan", nullable = false, precision = 10, scale = 2)
    private BigDecimal soTienHoan;

    @Column(name = "lydohoantien", nullable = false, length = 500)
    private String lyDoHoanTien;

    @Column(name = "trangthai", nullable = false, length = 50)
    private String trangThai = "ĐANG XỬ LÝ"; // ĐANG XỬ LÝ, HOÀN THÀNH, TỪ CHỐI

    @Column(name = "ngayycau", nullable = false)
    private LocalDateTime ngayYeuCau;

    @Column(name = "ngayhoan")
    private LocalDateTime ngayHoan;

    @Column(name = "nguoixuly", length = 100)
    private String nguoiXuLy;

    @Column(name = "ghichu", length = 500)
    private String ghiChu;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (ngayYeuCau == null) {
            ngayYeuCau = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isPending() {
        return "ĐANG XỬ LÝ".equals(trangThai);
    }

    public boolean isCompleted() {
        return "HOÀN THÀNH".equals(trangThai);
    }

    public boolean isRejected() {
        return "TỪ CHỐI".equals(trangThai);
    }

    // ==================== SOFT DELETE FIELDS ====================
    @Column(name = "da_xoa", nullable = false)
    private Boolean daXoa = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
