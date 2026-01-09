package com.example.j2ee.dto.datcho;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DatChoSearchRequest {
    @NotNull(message = "Mã đặt chỗ không được để trống")
    private Integer maDatCho;
    
    @NotBlank(message = "Tên hành khách không được để trống")
    private String tenHanhKhach;
}
