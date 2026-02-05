package com.example.j2ee.controller;

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
 * REST Controller for QuanLyHoanTien - Refund Management
 * Base URL: /admin/dashboard/hoantien
 *
 * Provides endpoints for:
 * - Listing refund requests with filters and search
 * - Viewing refund details
 * - Approving refund requests
 * - Rejecting refund requests
 * - Getting refund statistics
 */
@RestController
@RequestMapping("/admin/dashboard/hoantien")
public class QuanLyHoanTienController {

    private final HoanTienService hoanTienService;

    /**
     * Constructor injection of HoanTienService
     * 
     * @param hoanTienService Service layer for refund management
     */
    public QuanLyHoanTienController(HoanTienService hoanTienService) {
        this.hoanTienService = hoanTienService;
    }

    // ==================== LIST REFUNDS ENDPOINTS ====================

    /**
     * GET /hoantien - List refund requests with optional filters and search
     *
     * Query Parameters (all optional):
     * - search: Search by customer name, email, or reason (case-insensitive partial
     * match)
     * - trangThai: Filter by status (CHO_XU_LY, DA_HOAN_TIEN, TU_CHOI)
     * - tuNgay: Filter by request date from (ISO-8601 format:
     * yyyy-MM-dd'T'HH:mm:ss)
     * - denNgay: Filter by request date to (ISO-8601 format: yyyy-MM-dd'T'HH:mm:ss)
     *
     * @return List of refunds matching the filter criteria
     */
    @GetMapping
    @RequirePermission(feature = "REFUND", action = "VIEW")
    public ResponseEntity<ApiResponse<List<HoanTienResponse>>> getAllHoanTien(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        try {
            List<HoanTienResponse> hoanTienList = hoanTienService.getAllHoanTien(search, trangThai, tuNgay, denNgay);
            return ResponseEntity.ok(ApiResponse.success(hoanTienList));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách hoàn tiền: " + e.getMessage()));
        }
    }

    // ==================== SINGLE REFUND ENDPOINTS ====================

    /**
     * GET /hoantien/{id} - Get refund details by ID
     *
     * Retrieves complete refund details including:
     * - Basic refund information (amount, status, dates)
     * - Customer information (name, email, phone)
     * - Flight details
     * - Processing information
     *
     * @param id Refund ID (mahp)
     * @return Complete refund details
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "REFUND", action = "VIEW")
    public ResponseEntity<ApiResponse<HoanTienDetailResponse>> getHoanTienById(@PathVariable Integer id) {
        try {
            HoanTienDetailResponse hoanTien = hoanTienService.getHoanTienById(id);
            return ResponseEntity.ok(ApiResponse.success(hoanTien));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thông tin hoàn tiền: " + e.getMessage()));
        }
    }

    // ==================== APPROVE REFUND ENDPOINT ====================

    /**
     * PUT /hoantien/{id}/duyet - Approve refund request
     *
     * Approves a refund request with business validation:
     * - Refund must be in CHO_XU_LY status
     * - Updates status to DA_HOAN_TIEN
     * - Records processor and processing date
     * - Processes the actual refund (releases seat, updates booking status)
     *
     * @param id      Refund ID (mahp)
     * @param request Request body containing processor info
     * @return Updated refund information
     */
    @PutMapping("/{id}/duyet")
    @RequirePermission(feature = "REFUND", action = "APPROVE")
    public ResponseEntity<ApiResponse<HoanTienResponse>> duyetHoanTien(
            @PathVariable Integer id,
            @Valid @RequestBody DuyetHoanTienRequest request) {
        try {
            HoanTienResponse hoanTien = hoanTienService.duyetHoanTien(id, request.getNguoiXuLy(), request.getGhiChu());
            return ResponseEntity.ok(ApiResponse.success("Duyệt hoàn tiền thành công", hoanTien));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi duyệt hoàn tiền: " + e.getMessage()));
        }
    }

    // ==================== REJECT REFUND ENDPOINT ====================

    /**
     * PUT /hoantien/{id}/tuchoi - Reject refund request
     *
     * Rejects a refund request with business validation:
     * - Refund must be in CHO_XU_LY status
     * - Updates status to TU_CHOI
     * - Records processor, processing date, and rejection reason
     *
     * @param id      Refund ID (mahp)
     * @param request Request body containing processor info and rejection reason
     * @return Updated refund information
     */
    @PutMapping("/{id}/tuchoi")
    @RequirePermission(feature = "REFUND", action = "APPROVE")
    public ResponseEntity<ApiResponse<HoanTienResponse>> tuChoiHoanTien(
            @PathVariable Integer id,
            @Valid @RequestBody TuChoiHoanTienRequest request) {
        try {
            HoanTienResponse hoanTien = hoanTienService.tuChoiHoanTien(
                    id,
                    request.getNguoiXuLy(),
                    request.getLyDoTuChoi(),
                    request.getGhiChu());
            return ResponseEntity.ok(ApiResponse.success("Từ chối hoàn tiền thành công", hoanTien));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi từ chối hoàn tiền: " + e.getMessage()));
        }
    }

    // ==================== STATISTICS ENDPOINT ====================

    /**
     * GET /hoantien/thongke - Get refund statistics
     *
     * Retrieves statistics including:
     * - Total refund requests
     * - Pending requests count
     * - Approved requests count
     * - Rejected requests count
     * - Total refunded amount
     * - Total pending amount
     *
     * @return Refund statistics DTO
     */
    @GetMapping("/thongke")
    @RequirePermission(feature = "REFUND", action = "VIEW")
    public ResponseEntity<ApiResponse<HoanTienThongKeDTO>> getThongKe() {
        try {
            HoanTienThongKeDTO thongKe = hoanTienService.getThongKe();
            return ResponseEntity.ok(ApiResponse.success(thongKe));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thống kê hoàn tiền: " + e.getMessage()));
        }
    }
}
