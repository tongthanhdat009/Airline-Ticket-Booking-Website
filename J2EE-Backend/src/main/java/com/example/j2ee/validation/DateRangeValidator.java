package com.example.j2ee.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalDateTime;

/**
 * Validator kiểm tra ngày kết thúc phải sau ngày bắt đầu
 */
public class DateRangeValidator implements ConstraintValidator<ValidDateRange, Object> {

    @Override
    public void initialize(ValidDateRange constraintAnnotation) {
        // Không cần khởi tạo gì
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // Để @NotNull xử lý null
        }

        try {
            // Sử dụng reflection để lấy ngayBatDau và ngayKetThuc
            java.lang.reflect.Field ngayBatDauField = value.getClass().getDeclaredField("ngayBatDau");
            java.lang.reflect.Field ngayKetThucField = value.getClass().getDeclaredField("ngayKetThuc");

            ngayBatDauField.setAccessible(true);
            ngayKetThucField.setAccessible(true);

            Object ngayBatDauObj = ngayBatDauField.get(value);
            Object ngayKetThucObj = ngayKetThucField.get(value);

            if (ngayBatDauObj == null || ngayKetThucObj == null) {
                return true; // Để @NotNull xử lý null
            }

            LocalDateTime ngayBatDau = (LocalDateTime) ngayBatDauObj;
            LocalDateTime ngayKetThuc = (LocalDateTime) ngayKetThucObj;

            return ngayKetThuc.isAfter(ngayBatDau);
        } catch (Exception e) {
            return false;
        }
    }
}
