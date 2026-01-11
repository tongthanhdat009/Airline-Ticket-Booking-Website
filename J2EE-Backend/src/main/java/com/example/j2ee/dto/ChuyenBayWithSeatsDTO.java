package com.example.j2ee.dto;

import com.example.j2ee.model.ChiTietChuyenBay;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho chuyến bay kèm theo thông tin số ghế
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChuyenBayWithSeatsDTO {
    private ChiTietChuyenBay chuyenBay;
    private long tongSoGhe;
    private long soGheDaDat;
    private long soGheTrong;
    private boolean conVe;
    
    public ChuyenBayWithSeatsDTO(ChiTietChuyenBay chuyenBay, long tongSoGhe, long soGheDaDat) {
        this.chuyenBay = chuyenBay;
        this.tongSoGhe = tongSoGhe;
        this.soGheDaDat = soGheDaDat;
        this.soGheTrong = tongSoGhe - soGheDaDat;
        this.conVe = this.soGheTrong > 0;
    }
}
