package com.example.j2ee.dto.datcho;

import lombok.Data;

import java.math.BigDecimal;

/**
 * DTO cho request đổi hạng vé
 */
@Data
public class DoiHangVeRequest {
    
    private Integer maHangVeMoi;
    private Integer maGheMoi;
    private String lyDo;
}
