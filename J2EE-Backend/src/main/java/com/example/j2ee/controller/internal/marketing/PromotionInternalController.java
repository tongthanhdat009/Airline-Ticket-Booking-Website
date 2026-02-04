package com.example.j2ee.controller.internal.marketing;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.khuyenmai.CreateKhuyenMaiRequest;
import com.example.j2ee.dto.khuyenmai.KhuyenMaiResponse;
import com.example.j2ee.dto.khuyenmai.UpdateKhuyenMaiRequest;
import com.example.j2ee.service.KhuyenMaiService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Internal API Controller for Promotion Management
 * Base URL: /internal/promotions
 * 
 * Provides internal/admin APIs for promotion management.
 * JWT Authentication Required.
 */
@Slf4j
@RestController
@RequestMapping("/internal/promotions")
public class PromotionInternalController {

    private final KhuyenMaiService khuyenMaiService;

    public PromotionInternalController(KhuyenMaiService khuyenMaiService) {
        this.khuyenMaiService = khuyenMaiService;
    }

    // ==================== READ ENDPOINTS ====================

    /**
     * GET /internal/promotions - Get all promotions
     */
    @GetMapping
    @RequirePermission(feature = "PROMOTION", action = "VIEW")
    public ResponseEntity<ApiResponse<List<KhuyenMaiResponse>>> getAllPromotions() {
        List<KhuyenMaiResponse> promotions = khuyenMaiService.findAll();
        return ResponseEntity.ok(ApiResponse.success(promotions));
    }

    /**
     * GET /internal/promotions/{id} - Get promotion by ID
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "PROMOTION", action = "VIEW")
    public ResponseEntity<ApiResponse<KhuyenMaiResponse>> getPromotionById(@PathVariable Integer id) {
        try {
            KhuyenMaiResponse promotion = khuyenMaiService.findById(id);
            return ResponseEntity.ok(ApiResponse.success(promotion));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== CREATE ENDPOINTS ====================

    /**
     * POST /internal/promotions - Create new promotion
     */
    @PostMapping
    @RequirePermission(feature = "PROMOTION", action = "CREATE")
    public ResponseEntity<ApiResponse<KhuyenMaiResponse>> createPromotion(
            @Valid @RequestBody CreateKhuyenMaiRequest request) {
        try {
            KhuyenMaiResponse created = khuyenMaiService.create(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Tạo khuyến mãi thành công", created));
        } catch (IllegalArgumentException e) {
            log.error("Lỗi khi tạo khuyến mãi: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== UPDATE ENDPOINTS ====================

    /**
     * PUT /internal/promotions/{id} - Update promotion
     */
    @PutMapping("/{id}")
    @RequirePermission(feature = "PROMOTION", action = "UPDATE")
    public ResponseEntity<ApiResponse<KhuyenMaiResponse>> updatePromotion(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateKhuyenMaiRequest request) {
        try {
            KhuyenMaiResponse updated = khuyenMaiService.update(id, request);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật khuyến mãi thành công", updated));
        } catch (IllegalArgumentException e) {
            log.error("Lỗi khi cập nhật khuyến mãi: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * PUT /internal/promotions/{id}/restore - Restore deleted promotion
     */
    @PutMapping("/{id}/restore")
    @RequirePermission(feature = "PROMOTION", action = "RESTORE")
    public ResponseEntity<ApiResponse<KhuyenMaiResponse>> restorePromotion(@PathVariable Integer id) {
        try {
            KhuyenMaiResponse restored = khuyenMaiService.restore(id);
            return ResponseEntity.ok(ApiResponse.success("Khôi phục khuyến mãi thành công", restored));
        } catch (IllegalArgumentException e) {
            log.error("Lỗi khi khôi phục khuyến mãi: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * PATCH /internal/promotions/{id}/status - Update promotion status
     */
    @PatchMapping("/{id}/status")
    @RequirePermission(feature = "PROMOTION", action = "UPDATE")
    public ResponseEntity<ApiResponse<KhuyenMaiResponse>> updatePromotionStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("trangThai");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Trạng thái không được để trống"));
            }

            KhuyenMaiResponse updated = khuyenMaiService.updateStatus(id, newStatus);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", updated));
        } catch (IllegalArgumentException e) {
            log.error("Lỗi khi cập nhật trạng thái: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== DELETE ENDPOINTS ====================

    /**
     * DELETE /internal/promotions/{id} - Delete promotion (soft delete)
     */
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "PROMOTION", action = "DELETE")
    public ResponseEntity<ApiResponse<String>> deletePromotion(@PathVariable Integer id) {
        try {
            khuyenMaiService.delete(id);
            return ResponseEntity.ok(ApiResponse.success("Xóa khuyến mãi thành công"));
        } catch (IllegalArgumentException e) {
            log.error("Lỗi khi xóa khuyến mãi: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
