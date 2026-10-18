package com.example.j2ee.exception;

import com.example.j2ee.dto.ApiResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Fix RC-A (D-6/D-8/D-15): từ chối quyền → 403 (không lộ tên quyền),
 * lỗi hệ thống → 500 với message chung (không lộ internals).
 */
class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void permissionDenial_stays403_withoutLeakingPermissionName() {
        // Mô phỏng PermissionAspect ném khi thiếu FLIGHT_VIEW (case D-8).
        ResponseStatusException ex = new ResponseStatusException(
                HttpStatus.FORBIDDEN, "Yêu cầu quyền: FLIGHT_VIEW");
        ResponseEntity<ApiResponse<Void>> res = handler.handleResponseStatusException(ex);
        assertEquals(HttpStatus.FORBIDDEN, res.getStatusCode());
        assertNotNull(res.getBody());
        assertFalse(res.getBody().isSuccess());
        assertFalse(res.getBody().getMessage().contains("FLIGHT_VIEW"),
                "Không được lộ tên quyền nội bộ ra response");
    }

    @Test
    void unauthenticatedAspectError_stays403() {
        ResponseStatusException ex = new ResponseStatusException(
                HttpStatus.FORBIDDEN, "Chưa đăng nhập");
        ResponseEntity<ApiResponse<Void>> res = handler.handleResponseStatusException(ex);
        assertEquals(HttpStatus.FORBIDDEN, res.getStatusCode());
    }

    @Test
    void genericException_doesNotLeakInternals() {
        ResponseEntity<ApiResponse<Void>> res = handler.handleGeneralException(
                new RuntimeException("Secret password=abc123 at com.internal.Foo"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, res.getStatusCode());
        assertNotNull(res.getBody());
        assertFalse(res.getBody().getMessage().contains("abc123"));
        assertFalse(res.getBody().getMessage().contains("com.internal"));
    }

    @Test
    void illegalArgument_stays400_withOwnMessage() {
        ResponseEntity<ApiResponse<Void>> res =
                handler.handleIllegalArgumentException(new IllegalArgumentException("Sai ngày"));
        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
        assertEquals("Sai ngày", res.getBody().getMessage());
    }
}
