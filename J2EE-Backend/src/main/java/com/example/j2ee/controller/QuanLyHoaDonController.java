package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.hoadon.*;
import com.example.j2ee.service.HoaDonService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

/**
 * REST Controller for QuanLyHoaDon - Invoice Management
 * Base URL: /admin/dashboard/hoadon
 *
 * Provides endpoints for:
 * - Listing invoices with filters and sorting
 * - Viewing invoice details
 * - Finding invoices by invoice number
 * - Creating new invoices
 * - Updating invoices
 * - Cancelling invoices
 * - Soft deleting and restoring invoices
 * - Generating invoice numbers
 * - Getting invoice statistics
 */
@RestController
@RequestMapping("/admin/dashboard/hoadon")
public class QuanLyHoaDonController {

    private final HoaDonService hoaDonService;

    /**
     * Constructor injection of HoaDonService
     * @param hoaDonService Service layer for invoice management
     */
    public QuanLyHoaDonController(HoaDonService hoaDonService) {
        this.hoaDonService = hoaDonService;
    }

    // ==================== LIST INVOICES ENDPOINTS ====================

    /**
     * GET /hoadon - List invoices with optional filters and sorting
     *
     * Query Parameters (all optional):
     * - search: Search by invoice number, PNR, customer name or email
     * - trangThai: Filter by invoice status (DA_PHAT_HANH, DA_HUY, DIEU_CHINH)
     * - tuNgay: Filter by invoice date from (ISO-8601 format: yyyy-MM-dd)
     * - denNgay: Filter by invoice date to (ISO-8601 format: yyyy-MM-dd)
     * - sort: Sort by field (ngayLap, tongThanhToan, trangThai, soHoaDon) with optional direction
     *          Default sort: ngayLap:desc
     *
     * @return List of invoices matching the filter criteria
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<HoaDonResponse>>> getAllHoaDon(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay,
            @RequestParam(required = false) String sort
    ) {
        try {
            List<HoaDonResponse> hoaDonList = hoaDonService.getAllHoaDon(
                    search,
                    trangThai,
                    tuNgay,
                    denNgay,
                    sort
            );
            return ResponseEntity.ok(ApiResponse.success(hoaDonList));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách hóa đơn: " + e.getMessage()));
        }
    }

    // ==================== SINGLE INVOICE ENDPOINTS ====================

    /**
     * GET /hoadon/{id} - Get invoice details by ID
     *
     * Retrieves complete invoice details including:
     * - Basic invoice information (invoice number, dates, amounts, status)
     * - Order information (PNR, customer details)
     * - Audit information (created_at, updated_at)
     *
     * @param id Invoice ID (mahoadon)
     * @return Complete invoice details with nested data
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HoaDonDetailResponse>> getHoaDonById(@PathVariable Integer id) {
        try {
            HoaDonDetailResponse hoaDon = hoaDonService.getHoaDonById(id);
            return ResponseEntity.ok(ApiResponse.success(hoaDon));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thông tin hóa đơn: " + e.getMessage()));
        }
    }

    /**
     * GET /hoadon/sohoadon/{soHoaDon} - Find invoice by invoice number
     *
     * Retrieves complete invoice details using the unique invoice number.
     *
     * @param soHoaDon Invoice number (e.g., HD20250001)
     * @return Complete invoice details with nested data
     */
    @GetMapping("/sohoadon/{soHoaDon}")
    public ResponseEntity<ApiResponse<HoaDonDetailResponse>> getHoaDonBySoHoaDon(@PathVariable String soHoaDon) {
        try {
            HoaDonDetailResponse hoaDon = hoaDonService.getHoaDonBySoHoaDon(soHoaDon);
            return ResponseEntity.ok(ApiResponse.success(hoaDon));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi tìm hóa đơn theo số: " + e.getMessage()));
        }
    }

    // ==================== CREATE INVOICE ENDPOINT ====================

    /**
     * POST /hoadon - Create new invoice
     *
     * Creates a new invoice with business validation:
     * - Order must exist
     * - Invoice number must be unique
     * - Automatically calculates total payment (tongTien + thueVAT)
     *
     * @param request Request body containing invoice information
     * @return Created invoice information
     */
    @PostMapping
    public ResponseEntity<ApiResponse<HoaDonResponse>> createHoaDon(
            @Valid @RequestBody CreateHoaDonRequest request) {
        try {
            HoaDonResponse hoaDon = hoaDonService.createHoaDon(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Tạo hóa đơn thành công", hoaDon));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi tạo hóa đơn: " + e.getMessage()));
        }
    }

    // ==================== UPDATE INVOICE ENDPOINT ====================

    /**
     * PUT /hoadon/{id} - Update invoice
     *
     * Updates an existing invoice with business validation:
     * - Cannot update cancelled invoices
     * - Automatically recalculates total payment if VAT changes
     *
     * @param id Invoice ID (mahoadon)
     * @param request Request body containing updated information
     * @return Updated invoice information
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HoaDonResponse>> updateHoaDon(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateHoaDonRequest request) {
        try {
            HoaDonResponse hoaDon = hoaDonService.updateHoaDon(id, request);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật hóa đơn thành công", hoaDon));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi cập nhật hóa đơn: " + e.getMessage()));
        }
    }

    // ==================== CANCEL INVOICE ENDPOINT ====================

    /**
     * PUT /hoadon/{id}/huy - Cancel invoice
     *
     * Cancels an invoice with business validation:
     * - Cannot cancel already cancelled invoices
     * - Records cancellation reason and user
     * - Updates invoice status to DA_HUY
     *
     * @param id Invoice ID (mahoadon)
     * @param request Request body containing cancellation reason
     * @return Cancelled invoice information
     */
    @PutMapping("/{id}/huy")
    public ResponseEntity<ApiResponse<HoaDonResponse>> huyHoaDon(
            @PathVariable Integer id,
            @Valid @RequestBody HuyHoaDonRequest request) {
        try {
            HoaDonResponse hoaDon = hoaDonService.huyHoaDon(
                    id,
                    request.getLyDoHuy(),
                    request.getNguoiThucHien()
            );
            return ResponseEntity.ok(ApiResponse.success("Hủy hóa đơn thành công", hoaDon));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi hủy hóa đơn: " + e.getMessage()));
        }
    }

    // ==================== SOFT DELETE ENDPOINTS ====================

    /**
     * DELETE /hoadon/{id} - Soft delete invoice
     *
     * Soft deletes an invoice (sets da_xoa = true, deleted_at = now).
     * The invoice will no longer appear in the main list but can be restored.
     * Validation rules:
     * - Only cancelled invoices can be deleted
     *
     * @param id Invoice ID (mahoadon)
     * @return Success message confirming soft deletion
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> softDeleteHoaDon(@PathVariable Integer id) {
        try {
            hoaDonService.softDeleteHoaDon(id);
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa hóa đơn thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi xóa hóa đơn: " + e.getMessage()));
        }
    }

    /**
     * PUT /hoadon/{id}/restore - Restore soft-deleted invoice
     *
     * Restores an invoice that has been soft-deleted (da_xoa = true).
     * The invoice will be visible again in the main invoice list.
     *
     * @param id Invoice ID (mahoadon)
     * @return Success message confirming restoration
     */
    @PutMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreHoaDon(@PathVariable Integer id) {
        try {
            hoaDonService.restoreHoaDon(id);
            return ResponseEntity.ok(ApiResponse.successMessage("Khôi phục hóa đơn thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi khôi phục hóa đơn: " + e.getMessage()));
        }
    }

    // ==================== UTILITY ENDPOINTS ====================

    /**
     * GET /hoadon/generate-sohoadon - Generate next invoice number
     *
     * Generates a unique invoice number following the pattern HD{YYYY}{NNNN}
     * Example: HD20250001, HD20250002, etc.
     *
     * @return Generated invoice number
     */
    @GetMapping("/generate-sohoadon")
    public ResponseEntity<ApiResponse<String>> generateSoHoaDon() {
        try {
            String soHoaDon = hoaDonService.generateSoHoaDon();
            return ResponseEntity.ok(ApiResponse.success(soHoaDon));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi tạo số hóa đơn: " + e.getMessage()));
        }
    }

    // ==================== STATISTICS ENDPOINT ====================

    /**
     * GET /hoadon/thongke - Get invoice statistics
     *
     * Retrieves statistics including:
     * - Total number of invoices
     * - Issued invoices count (DA_PHAT_HANH)
     * - Cancelled invoices count (DA_HUY)
     * - Adjusted invoices count (DIEU_CHINH)
     * - Total revenue (DA_PHAT_HANH)
     * - Total VAT collected
     * - Total actual payment received
     *
     * @return Invoice statistics DTO
     */
    @GetMapping("/thongke")
    public ResponseEntity<ApiResponse<HoaDonThongKeDTO>> getThongKe() {
        try {
            HoaDonThongKeDTO thongKe = hoaDonService.getThongKe();
            return ResponseEntity.ok(ApiResponse.success(thongKe));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thống kê hóa đơn: " + e.getMessage()));
        }
    }
}
