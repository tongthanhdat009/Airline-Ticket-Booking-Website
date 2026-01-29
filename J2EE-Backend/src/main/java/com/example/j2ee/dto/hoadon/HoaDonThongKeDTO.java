package com.example.j2ee.dto.hoadon;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cho thống kê hóa đơn
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoaDonThongKeDTO {

    private long tongSoHoaDon;
    private long daPhatHanh;
    private long daHuy;
    private long dieuChinh;

    private BigDecimal tongDoanhThu;
    private BigDecimal tongThueVAT;
    private BigDecimal tongThanhToanThucTe;
}
