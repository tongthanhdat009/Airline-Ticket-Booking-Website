package com.example.j2ee.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation để đánh dấu yêu cầu permission cụ thể
 * Sử dụng ở level method hoặc class trong Controller
 *
 * Ví dụ:
 * @RequirePermission(feature = "FLIGHT", action = "CREATE")
 * public ResponseEntity<?> createFlight(...) { ... }
 *
 * @RequirePermission(feature = "BOOKING", action = "CANCEL")
 * @PostMapping("/bookings/{id}/cancel")
 * public ResponseEntity<?> cancelBooking(...) { ... }
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {

    /**
     * Mã chức năng (feature code)
     * Ví dụ: "FLIGHT", "BOOKING", "PAYMENT", "USER", "ROLE", v.v.
     */
    String feature();

    /**
     * Mã hành động (action code)
     * Ví dụ: "VIEW", "CREATE", "UPDATE", "DELETE", "APPROVE", "CANCEL", v.v.
     */
    String action();
}
