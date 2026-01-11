package com.example.j2ee.dto.khuyenmai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * Request áp dụng mã khuyến mãi cho đơn hàng
 */
@Data
public class ApplyCouponRequest {
    
    @NotBlank(message = "Mã khuyến mãi không được để trống")
    private String maKM;
    
    @NotEmpty(message = "Danh sách vé không được để trống")
    private List<Integer> danhSachMaDatCho;
}
