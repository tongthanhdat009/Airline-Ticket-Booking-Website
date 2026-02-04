package com.example.j2ee.controller.internal.finance;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.hoantien.*;
import com.example.j2ee.service.HoanTienService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Internal API Controller for Refund Management
 * Base URL: /internal/refunds
 * 
 * Provides internal/admin APIs for refund management.
 * JWT Authentication Required.
 */
@RestController
@RequestMapping("/internal/refunds")
public class RefundInternalController {

    private final HoanTienService hoanTienService;

    public RefundInternalController(HoanTienService hoanTienService) {
        this.hoanTienService = hoanTienService;
    }

    // ==================== READ ENDPOINTS ====================

    /**
     * GET /internal/refunds - List refunds with filters
     */
    @GetMapping
    @RequirePermission(feature = "REFUND", action = "VIEW")
    public ResponseEntity<ApiResponse<List<HoanTienResponse>>> getAllRefunds(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        try {
            List<HoanTienResponse> refunds = hoanTienService.getAllHoanTien(search, trangThai, tuNgay, denNgay);
            return ResponseEntity.ok(ApiResponse.success(refunds));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách hoàn tiền: " + e.getMessage()));
        }
    }

    /**
     * GET /internal/refunds/{id} - Get refund details
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "REFUND", action = "VIEW")
    public ResponseEntity<ApiResponse<HoanTienDetailResponse>> getRefundById(@PathVariable Integer id) {
        try {
            HoanTienDetailResponse refund = hoanTienService.getHoanTienById(id);
            return ResponseEntity.ok(ApiResponse.success(refund));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thông tin hoàn tiền: " + e.getMessage()));
        }
    }

    /**
     * GET /internal/refunds/statistics - Get refund statistics
     */
    @GetMapping("/statistics")
    @RequirePermission(feature = "REFUND", action = "VIEW")
    public ResponseEntity<ApiResponse<HoanTienThongKeDTO>> getStatistics() {
        try {
            HoanTienThongKeDTO statistics = hoanTienService.getThongKe();
            return ResponseEntity.ok(ApiResponse.success(statistics));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thống kê hoàn tiền: " + e.getMessage()));
        }
    }

    // ==================== UPDATE ENDPOINTS ====================

    /**
     * PUT /internal/refunds/{id}/approve - Approve refund request
     */
    @PutMapping("/{id}/approve")
    @RequirePermission(feature = "REFUND", action = "APPROVE")
    public ResponseEntity<ApiResponse<HoanTienResponse>> approveRefund(
            @PathVariable Integer id,
            @Valid @RequestBody DuyetHoanTienRequest request) {
        try {
            HoanTienResponse refund = hoanTienService.duyetHoanTien(id, request.getNguoiXuLy(), request.getGhiChu());
            return ResponseEntity.ok(ApiResponse.success("Duyệt hoàn tiền thành công", refund));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi duyệt hoàn tiền: " + e.getMessage()));
        }
    }

    /**
     * PUT /internal/refunds/{id}/reject - Reject refund request
     */
    @PutMapping("/{id}/reject")
    @RequirePermission(feature = "REFUND", action = "APPROVE")
    public ResponseEntity<ApiResponse<HoanTienResponse>> rejectRefund(
            @PathVariable Integer id,
            @Valid @RequestBody TuChoiHoanTienRequest request) {
        try {
            HoanTienResponse refund = hoanTienService.tuChoiHoanTien(
                    id,
                    request.getNguoiXuLy(),
                    request.getLyDoTuChoi(),
                    request.getGhiChu());
            return ResponseEntity.ok(ApiResponse.success("Từ chối hoàn tiền thành công", refund));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi từ chối hoàn tiền: " + e.getMessage()));
        }
    }
}
