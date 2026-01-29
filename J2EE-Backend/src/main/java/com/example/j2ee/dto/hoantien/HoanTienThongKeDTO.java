package com.example.j2ee.dto.hoantien;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cho thống kê hoàn tiền
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoanTienThongKeDTO {
    
    private long tongYeuCau;
    private long choXuLy;
    private long daHoanTien;
    private long daTuChoi;
    
    private BigDecimal tongTienDaHoan;
    private BigDecimal tongTienChoHoan;
}
