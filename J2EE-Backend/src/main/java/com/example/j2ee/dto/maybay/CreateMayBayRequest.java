package com.example.j2ee.dto.maybay;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO để tạo máy bay mới
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateMayBayRequest {

    @NotBlank(message = "Tên máy bay không được để trống")
    @Size(max = 255, message = "Tên máy bay không được quá 255 ký tự")
    private String tenMayBay;

    @NotBlank(message = "Hãng máy bay không được để trống")
    @Size(max = 100, message = "Hãng máy bay không được quá 100 ký tự")
    private String hangMayBay;

    @NotBlank(message = "Loại máy bay không được để trống")
    @Size(max = 100, message = "Loại máy bay không được quá 100 ký tự")
    private String loaiMayBay;

    @NotBlank(message = "Số hiệu không được để trống")
    @Size(max = 50, message = "Số hiệu không được quá 50 ký tự")
    @Pattern(regexp = "^[A-Z0-9\\-]+$", message = "Số hiệu chỉ được chứa chữ hoa, số và dấu gạch ngang")
    private String soHieu;

    @NotNull(message = "Tổng số ghế không được để trống")
    @Min(value = 1, message = "Tổng số ghế phải lớn hơn 0")
    private Integer tongSoGhe;

    @Pattern(regexp = "Hoạt động|Bảo trì|Vô hiệu", message = "Trạng thái phải là: Hoạt động, Bảo trì, Vô hiệu")
    private String trangThai = "Hoạt động";

    @Min(value = 1900, message = "Năm khai thác phải từ năm 1900")
    private Integer namKhaiThac;
}
