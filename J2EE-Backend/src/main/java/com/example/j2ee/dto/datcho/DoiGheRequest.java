package com.example.j2ee.dto.datcho;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

/**
 * DTO cho request đổi ghế
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoiGheRequest {
    
    @NotNull(message = "Mã ghế mới không được để trống")
    private Integer maGheMoi;
    
    private String lyDo;
}
