package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.khuyenmai.CreateKhuyenMaiRequest;
import com.example.j2ee.dto.khuyenmai.KhuyenMaiResponse;
import com.example.j2ee.dto.khuyenmai.UpdateKhuyenMaiRequest;
import com.example.j2ee.service.KhuyenMaiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller cho Quản lý Khuyến Mãi
 * Base URL: /api/khuyenmai
 */
@Slf4j
@RestController
@RequestMapping("/api/khuyenmai")
@RequiredArgsConstructor
public class KhuyenMaiController {

    private final KhuyenMaiService khuyenMaiService;

    /**
     * Lấy tất cả khuyến mãi
     * GET /api/khuyenmai
     */
    @GetMapping
    @PreAuthorize("hasAuthority('PROMOTION_MANAGE')")
    public ResponseEntity<ApiResponse<List<KhuyenMaiResponse>>> findAll() {
        List<KhuyenMaiResponse> promotions = khuyenMaiService.findAll();
        return ResponseEntity.ok(ApiResponse.success(promotions));
    }

    /**
     * Lấy khuyến mãi theo ID
     * GET /api/khuyenmai/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PROMOTION_MANAGE')")
    public ResponseEntity<ApiResponse<KhuyenMaiResponse>> findById(@PathVariable Integer id) {
        try {
            KhuyenMaiResponse promotion = khuyenMaiService.findById(id);
            return ResponseEntity.ok(ApiResponse.success(promotion));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Tạo khuyến mãi mới
     * POST /api/khuyenmai
     */
    @PostMapping
    @PreAuthorize("hasAuthority('PROMOTION_CREATE')")
    public ResponseEntity<ApiResponse<KhuyenMaiResponse>> create(
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

    /**
     * Cập nhật khuyến mãi
     * PUT /api/khuyenmai/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PROMOTION_UPDATE')")
    public ResponseEntity<ApiResponse<KhuyenMaiResponse>> update(
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
     * Xóa mềm khuyến mãi
     * DELETE /api/khuyenmai/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PROMOTION_DELETE')")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Integer id) {
        try {
            khuyenMaiService.delete(id);
            return ResponseEntity.ok(ApiResponse.success("Xóa khuyến mãi thành công"));
        } catch (IllegalArgumentException e) {
            log.error("Lỗi khi xóa khuyến mãi: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Khôi phục khuyến mãi đã xóa
     * PUT /api/khuyenmai/{id}/restore
     */
    @PutMapping("/{id}/restore")
    @PreAuthorize("hasAuthority('PROMOTION_RESTORE')")
    public ResponseEntity<ApiResponse<KhuyenMaiResponse>> restore(@PathVariable Integer id) {
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
     * Cập nhật trạng thái khuyến mãi
     * PATCH /api/khuyenmai/{id}/status
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('PROMOTION_UPDATE')")
    public ResponseEntity<ApiResponse<KhuyenMaiResponse>> updateStatus(
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
}
