package com.example.j2ee.dto.hoantien;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho request từ chối hoàn tiền
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TuChoiHoanTienRequest {
    
    @NotNull(message = "Mã hoàn tiền không được để trống")
    private Integer maHoanTien;
    
    @NotBlank(message = "Ngưởi xử lý không được để trống")
    private String nguoiXuLy;
    
    @NotBlank(message = "Lý do từ chối không được để trống")
    private String lyDoTuChoi;
    
    private String ghiChu;
}
