package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.khuyenmai.ValidateCouponRequest;
import com.example.j2ee.dto.khuyenmai.ValidateCouponResponse;
import com.example.j2ee.service.KhuyenMaiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller cho Client - Kiểm tra mã khuyến mãi
 * Base URL: /api/client/khuyenmai
 * Không cần authentication (permitAll)
 */
@Slf4j
@RestController
@RequestMapping("/client/khuyenmai")
@RequiredArgsConstructor
public class ClientKhuyenMaiController {

    private final KhuyenMaiService khuyenMaiService;

    /**
     * Kiểm tra mã khuyến mãi
     * POST /api/client/khuyenmai/validate
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<ValidateCouponResponse>> validateCoupon(
            @Valid @RequestBody ValidateCouponRequest request) {
        try {
            ValidateCouponResponse response = khuyenMaiService.validateCoupon(request);
            if (response.isValid()) {
                return ResponseEntity.ok(ApiResponse.success("Mã khuyến mãi hợp lệ", response));
            } else {
                return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
            }
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra mã khuyến mãi: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Không thể kiểm tra mã khuyến mãi: " + e.getMessage()));
        }
    }
}
