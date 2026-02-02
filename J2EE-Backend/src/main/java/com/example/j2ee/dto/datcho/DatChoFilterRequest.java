package com.example.j2ee.dto.datcho;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO cho request filter danh sách đặt chỗ (admin)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatChoFilterRequest {
    
    private Integer maChuyenBay;
    private String trangThai;
    private LocalDate tuNgay;
    private LocalDate denNgay;
    private String search;
    
    @Builder.Default
    private Integer page = 0;
    
    @Builder.Default
    private Integer size = 20;
}
