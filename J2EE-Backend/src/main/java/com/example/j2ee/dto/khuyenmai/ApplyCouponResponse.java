package com.example.j2ee.dto.khuyenmai;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Response áp dụng mã khuyến mãi
 */
@Data
public class ApplyCouponResponse {
    
    private int maKhuyenMai;
    
    private String tenKhuyenMai;
    
    private BigDecimal tongGiaTruocKM; // Tổng giá trước khi áp dụng khuyến mãi
    
    private BigDecimal tongGiaSauKM; // Tổng giá sau khi áp dụng khuyến mãi
    
    private BigDecimal giaTriGiam; // Tổng giá trị giảm
    
    /**
     * Phân bổ giảm giá theo từng vé
     * Map<MaDatCho, GiaTriGiam>
     * Quan trọng để khi hoàn tiền, biết chính xác mỗi vé được giảm bao nhiêu
     */
    private Map<Integer, BigDecimal> phanBoTheoVe;
}
