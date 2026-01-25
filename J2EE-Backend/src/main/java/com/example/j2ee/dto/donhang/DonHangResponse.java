package com.example.j2ee.dto.donhang;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DonHangResponse {
    private Integer maDonHang;
    private String pnr;
    private LocalDateTime ngayDat;
    private BigDecimal tongGia;
    private String trangThai;
    private String emailNguoiDat;
    private String soDienThoaiNguoiDat;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
