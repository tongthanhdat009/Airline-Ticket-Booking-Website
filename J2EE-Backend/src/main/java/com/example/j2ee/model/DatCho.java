package com.example.j2ee.model; // Thay đổi package cho phù hợp


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.Set;

@Entity
@Table(name = "datcho")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DatCho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "madatcho")
    private int maDatCho;

    @Column(name = "ngaydatcho", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date ngayDatCho;

    @Column(name = "checkin_status", nullable = false)
    private boolean checkInStatus = false;

    @Column(name = "checkin_time")
    @Temporal(TemporalType.TIMESTAMP)
    private Date checkInTime;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mahanhkhach", referencedColumnName = "mahanhkhach")
    @JsonIgnoreProperties({"datCho", "taiKhoan"})
    private HanhKhach hanhKhach;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "maghe", referencedColumnName = "maghe", unique = true)
    @JsonIgnoreProperties({"datCho"})
    private ChiTietGhe chiTietGhe;

    @OneToOne(mappedBy = "datCho", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private TrangThaiThanhToan trangThaiThanhToan;

    @OneToMany(mappedBy = "datCho", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"datCho"})
    private Set<DatChoDichVu> danhSachDichVu;
}