package com.example.j2ee.model; // Thay đổi package cho phù hợp

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
import java.util.Date;

@Entity
@Table(name = "trangthaithanhtoan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@SQLDelete(sql = "UPDATE trangthaithanhtoan SET da_xoa = 1, deleted_at = NOW() WHERE mathanhtoan = ?")
@SQLRestriction("da_xoa = 0")
public class TrangThaiThanhToan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mathanhtoan")
    private int maThanhToan;

    @Column(name = "dathanhtoan", nullable = false, length = 1)
    private char daThanhToan;

    @Column(name = "phuongthucthanhtoan", length = 50)
    private String phuongThucThanhToan; // VNPAY, CHUYEN_KHOAN, TIEN_MAT

    @Column(name = "ngayhethan")
    @Temporal(TemporalType.DATE)
    private Date ngayHetHan;

    @Column(name = "sotien", nullable = false, precision = 10, scale = 2)
    private BigDecimal soTien;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "madonhang", nullable = false, unique = true)
    @JsonIgnoreProperties({"danhSachDatCho"})
    private DonHang donHang;

    @Column(name = "transaction_code", length = 100)
    private String transactionCode;

    @Column(name = "trangthai", length = 20)
    private String trangThai = "PENDING";

    @Column(name = "thoigian_thanhtoan")
    private LocalDateTime thoigianThanhToan;

    // ==================== SOFT DELETE FIELDS ====================
    @Column(name = "da_xoa", nullable = false)
    private Boolean daXoa = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}