package com.example.j2ee.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation để đánh dấu yêu cầu role cụ thể
 * Hỗ trợ multiple roles (user chỉ cần có ít nhất một role trong danh sách)
 *
 * Ví dụ:
 * @RequireRole({"SUPER_ADMIN", "QUAN_LY"})
 * public ResponseEntity<?> manageSystem(...) { ... }
 *
 * @RequireRole("KE_TOAN")
 * @GetMapping("/reports/financial")
 * public ResponseEntity<?> getFinancialReport(...) { ... }
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {

    /**
     * Danh sách các vai trò yêu cầu
     * User cần có ít nhất một trong các vai trò này
     */
    String[] value();
}
