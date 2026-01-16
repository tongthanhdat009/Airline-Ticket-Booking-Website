package com.example.j2ee.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Annotation kiểm tra ngày kết thúc phải sau ngày bắt đầu
 */
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = DateRangeValidator.class)
public @interface ValidDateRange {
    String message() default "Ngày kết thúc phải sau ngày bắt đầu";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
