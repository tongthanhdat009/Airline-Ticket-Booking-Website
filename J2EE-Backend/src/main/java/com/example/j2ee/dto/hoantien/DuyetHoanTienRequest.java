package com.example.j2ee.dto.hoantien;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho request duyệt hoàn tiền
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DuyetHoanTienRequest {
    
    @NotNull(message = "Mã hoàn tiền không được để trống")
    private Integer maHoanTien;
    
    @NotBlank(message = "Ngưởi xử lý không được để trống")
    private String nguoiXuLy;
    
    private String ghiChu;
}
