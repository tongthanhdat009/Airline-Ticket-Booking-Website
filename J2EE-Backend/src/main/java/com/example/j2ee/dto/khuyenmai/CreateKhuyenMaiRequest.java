package com.example.j2ee.dto.khuyenmai;

import com.example.j2ee.validation.ValidDateRange;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Request DTO để tạo khuyến mãi mới
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@ValidDateRange
public class CreateKhuyenMaiRequest {

    @NotBlank(message = "Mã khuyến mãi không được để trống")
    @Size(max = 20, message = "Mã khuyến mãi không được quá 20 ký tự")
    private String maKM;

    @NotBlank(message = "Tên khuyến mãi không được để trống")
    @Size(max = 255, message = "Tên khuyến mãi không được quá 255 ký tự")
    private String tenKhuyenMai;

    @Size(max = 500, message = "Mô tả không được quá 500 ký tự")
    private String moTa;

    @NotBlank(message = "Loại khuyến mãi không được để trống")
    @Pattern(regexp = "PERCENT|FIXED", message = "Loại khuyến mãi phải là PERCENT hoặc FIXED")
    private String loaiKhuyenMai;

    @NotNull(message = "Giá trị giảm không được để trống")
    @DecimalMin(value = "0.01", message = "Giá trị giảm phải lớn hơn 0")
    @Digits(integer = 8, fraction = 2, message = "Giá trị giảm không hợp lệ")
    private BigDecimal giaTriGiam;

    @DecimalMin(value = "0", message = "Giá trị tối thiểu không được âm")
    @Digits(integer = 8, fraction = 2, message = "Giá trị tối thiểu không hợp lệ")
    private BigDecimal giaTriToiThieu;

    @DecimalMin(value = "0", message = "Giá trị tối đa không được âm")
    @Digits(integer = 8, fraction = 2, message = "Giá trị tối đa không hợp lệ")
    private BigDecimal giaTriToiDa;

    @Min(value = 1, message = "Số lượng phải ít nhất là 1")
    private Integer soLuong;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDateTime ngayBatDau;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDateTime ngayKetThuc;

    @NotBlank(message = "Trạng thái không được để trống")
    @Pattern(regexp = "ACTIVE|INACTIVE", message = "Trạng thái phải là ACTIVE hoặc INACTIVE")
    private String trangThai = "ACTIVE";

    /**
     * Custom validation: Giá trị tối đa phải >= giá trị tối thiểu
     */
    @AssertTrue(message = "Giá trị tối đa phải lớn hơn hoặc bằng giá trị tối thiểu")
    private boolean isGiaTriToiDaValid() {
        if (giaTriToiDa == null || giaTriToiThieu == null) {
            return true;
        }
        return giaTriToiDa.compareTo(giaTriToiThieu) >= 0;
    }
}
