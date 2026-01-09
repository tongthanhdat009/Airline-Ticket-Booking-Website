package com.example.j2ee.model; // Thay đổi package cho phù hợp

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "trangthaithanhtoan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TrangThaiThanhToan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mathanhtoan")
    private int maThanhToan;

    @Column(name = "dathanhtoan", nullable = false, length = 1)
    private char daThanhToan;

    @Column(name = "ngayhethan")
    @Temporal(TemporalType.DATE)
    private Date ngayHetHan;

    @Column(name = "sotien", nullable = false, precision = 10, scale = 2)
    private BigDecimal soTien;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "madatcho", referencedColumnName = "madatcho", nullable = true, unique = true)
    @JsonIgnoreProperties({"trangThaiThanhToan", "danhSachDichVu"})
    private DatCho datCho;
}