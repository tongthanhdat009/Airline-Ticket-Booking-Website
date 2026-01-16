package com.example.j2ee.dto.hangve;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO để cập nhật hạng vé
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateHangVeRequest {

    @NotBlank(message = "Tên hạng vé không được để trống")
    @Size(min = 2, max = 255, message = "Tên hạng vé phải từ 2 đến 255 ký tự")
    private String tenHangVe;
}
