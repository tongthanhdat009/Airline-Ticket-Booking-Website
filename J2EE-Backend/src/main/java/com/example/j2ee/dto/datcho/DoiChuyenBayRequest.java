package com.example.j2ee.dto.datcho;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

/**
 * DTO cho request đổi chuyến bay
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoiChuyenBayRequest {
    
    @NotNull(message = "Mã chuyến bay mới không được để trống")
    private Integer maChuyenBayMoi;
    
    @NotNull(message = "Mã ghế mới không được để trống")
    private Integer maGheMoi;
    
    private String lyDo;
}
