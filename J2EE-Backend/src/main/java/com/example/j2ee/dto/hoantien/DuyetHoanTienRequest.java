package com.example.j2ee.dto.hoantien;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
    @Size(max = 100, message = "Người xử lý tối đa 100 ký tự")
    private String nguoiXuLy;

    @Size(max = 500, message = "Ghi chú tối đa 500 ký tự")
    private String ghiChu;
}
