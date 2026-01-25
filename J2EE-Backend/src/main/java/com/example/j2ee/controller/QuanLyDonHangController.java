package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.donhang.DonHangDetailResponse;
import com.example.j2ee.dto.donhang.DonHangResponse;
import com.example.j2ee.dto.donhang.HuyDonHangRequest;
import com.example.j2ee.dto.donhang.UpdateTrangThaiDonHangRequest;
import com.example.j2ee.service.DonHangService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * REST Controller for QuanLyDonHang - Order Management
 * Base URL: /admin/dashboard/donhang
 *
 * Provides endpoints for:
 * - Listing orders with filters and sorting
 * - Viewing order details
 * - Finding orders by PNR
 * - Updating order status
 * - Cancelling orders
 * - Soft deleting and restoring orders
 */
@RestController
@RequestMapping("/admin/dashboard/donhang")
public class QuanLyDonHangController {

    private final DonHangService donHangService;

    /**
     * Constructor injection of DonHangService
     * @param donHangService Service layer for order management
     */
    public QuanLyDonHangController(DonHangService donHangService) {
        this.donHangService = donHangService;
    }

    // ==================== LIST ORDERS ENDPOINTS ====================

    /**
     * GET /donhang - List orders with optional filters and sorting
     *
     * Query Parameters (all optional):
     * - trangThai: Filter by order status (CHỜ THANH TOÁN, ĐÃ THANH TOÁN, ĐÃ HỦY)
     * - email: Filter by customer email (case-insensitive partial match)
     * - soDienThoai: Filter by customer phone number (partial match)
     * - pnr: Filter by PNR code (case-insensitive partial match)
     * - tuNgay: Filter by order date from (ISO-8601 format: yyyy-MM-dd'T'HH:mm:ss)
     * - denNgay: Filter by order date to (ISO-8601 format: yyyy-MM-dd'T'HH:mm:ss)
     * - tuGia: Filter by total price from (BigDecimal)
     * - denGia: Filter by total price to (BigDecimal)
     * - sort: Sort by field (ngayDat, tongGia, trangThai, pnr) with optional direction (field:asc or field:desc)
     *          Default sort: ngayDat:desc
     *
     * @return List of orders matching the filter criteria
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DonHangResponse>>> getAllDonHang(
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String soDienThoai,
            @RequestParam(required = false) String pnr,
            @RequestParam(required = false) LocalDateTime tuNgay,
            @RequestParam(required = false) LocalDateTime denNgay,
            @RequestParam(required = false) String tuGia,
            @RequestParam(required = false) String denGia,
            @RequestParam(required = false) String sort
    ) {
        try {
            List<DonHangResponse> donHangList = donHangService.getAllDonHang(
                    trangThai,
                    email,
                    soDienThoai,
                    pnr,
                    tuNgay,
                    denNgay,
                    tuGia != null ? new BigDecimal(tuGia) : null,
                    denGia != null ? new BigDecimal(denGia) : null,
                    sort
            );
            return ResponseEntity.ok(ApiResponse.success(donHangList));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách đơn hàng: " + e.getMessage()));
        }
    }

    // Endpoints will be added in subsequent subtasks:
    // - subtask-3-3: GET /donhang/{id} - Get order details
    // - subtask-3-4: GET /donhang/pnr/{pnr} - Find by PNR
    // - subtask-3-5: PUT /donhang/{id}/trangthai - Update status
    // - subtask-3-6: PUT /donhang/{id}/huy - Cancel order
    // - subtask-3-7: GET /donhang/deleted - View deleted orders
    // - subtask-3-8: PUT /donhang/{id}/restore - Restore deleted order
    // - subtask-3-9: DELETE /donhang/{id} - Soft delete order
}
