package com.example.j2ee.controller;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.donhang.BatchApproveRequest;
import com.example.j2ee.dto.donhang.BatchRefundRequest;
import com.example.j2ee.dto.donhang.DonHangDetailResponse;
import com.example.j2ee.dto.donhang.DonHangResponse;
import com.example.j2ee.dto.donhang.HuyDonHangRequest;
import com.example.j2ee.dto.donhang.UpdateTrangThaiDonHangRequest;
import com.example.j2ee.service.DonHangService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
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
     * 
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
     * - sort: Sort by field (ngayDat, tongGia, trangThai, pnr) with optional
     * direction (field:asc or field:desc)
     * Default sort: ngayDat:desc
     *
     * @return List of orders matching the filter criteria
     */
    @GetMapping
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<ApiResponse<List<DonHangResponse>>> getAllDonHang(
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String soDienThoai,
            @RequestParam(required = false) String pnr,
            @RequestParam(required = false) LocalDateTime tuNgay,
            @RequestParam(required = false) LocalDateTime denNgay,
            @RequestParam(required = false) String tuGia,
            @RequestParam(required = false) String denGia,
            @RequestParam(required = false) String sort) {
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
                    sort);
            return ResponseEntity.ok(ApiResponse.success(donHangList));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách đơn hàng: " + e.getMessage()));
        }
    }

    // ==================== SINGLE ORDER ENDPOINTS ====================

    /**
     * GET /donhang/{id} - Get order details by ID
     *
     * Retrieves complete order details including:
     * - Basic order information (PNR, dates, prices, status)
     * - Customer information (HanhKhach who placed the order)
     * - All bookings (DatCho) with flight details
     *
     * @param id Order ID (madonhang)
     * @return Complete order details with nested data
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<ApiResponse<DonHangDetailResponse>> getDonHangById(@PathVariable int id) {
        try {
            DonHangDetailResponse donHang = donHangService.getDonHangById(id);
            return ResponseEntity.ok(ApiResponse.success(donHang));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thông tin đơn hàng: " + e.getMessage()));
        }
    }

    /**
     * GET /donhang/pnr/{pnr} - Find order by PNR code
     *
     * Retrieves complete order details using the unique PNR (Passenger Name Record)
     * code.
     * PNR is a unique identifier for each booking in the airline system.
     *
     * @param pnr PNR code (6-character alphanumeric code)
     * @return Complete order details with nested data
     */
    @GetMapping("/pnr/{pnr}")
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<ApiResponse<DonHangDetailResponse>> getDonHangByPnr(@PathVariable String pnr) {
        try {
            DonHangDetailResponse donHang = donHangService.getDonHangByPnr(pnr);
            return ResponseEntity.ok(ApiResponse.success(donHang));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi tìm đơn hàng theo PNR: " + e.getMessage()));
        }
    }

    // ==================== ORDER STATUS ENDPOINTS ====================

    /**
     * PUT /donhang/{id}/trangthai - Update order status
     *
     * Updates the status of an order with business validation:
     * - CHỜ THANH TOÁN → ĐÃ THANH TOÁN
     * - CHỜ THANH TOÁN → ĐÃ HỦY
     * - ĐÃ THANH TOÁN → ĐÃ HỦY (refund)
     * - ĐÃ HỦY → CHỜ THANH TOÁN (restore)
     *
     * Invalid transitions will be rejected with 400 Bad Request
     *
     * @param id      Order ID (madonhang)
     * @param request Request body containing new status
     * @return Updated order information
     */
    @PutMapping("/{id}/trangthai")
    @RequirePermission(feature = "ORDER", action = "UPDATE")
    public ResponseEntity<ApiResponse<DonHangResponse>> updateTrangThaiDonHang(
            @PathVariable int id,
            @Valid @RequestBody UpdateTrangThaiDonHangRequest request) {
        try {
            DonHangResponse donHang = donHangService.updateTrangThai(id, request);
            return ResponseEntity.ok(ApiResponse.success(donHang));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi cập nhật trạng thái đơn hàng: " + e.getMessage()));
        }
    }

    /**
     * PUT /donhang/{id}/huy - Cancel order
     *
     * Cancels an order with comprehensive business validation:
     * - Cannot cancel if order is already cancelled (ĐÃ HỦY)
     * - Cannot cancel if any passenger has checked-in
     * - Cannot cancel after flight has departed
     * - Updates order status to ĐÃ HỦY
     * - Updates all related DatCho to CANCELLED
     * - Records cancellation reason in ghiChu
     *
     * @param id      Order ID (madonhang)
     * @param request Request body containing cancellation reason
     * @return Updated order information
     */
    @PutMapping("/{id}/huy")
    @RequirePermission(feature = "ORDER", action = "CANCEL")
    public ResponseEntity<ApiResponse<DonHangResponse>> huyDonHang(
            @PathVariable int id,
            @Valid @RequestBody HuyDonHangRequest request) {
        try {
            DonHangResponse donHang = donHangService.huyDonHang(id, request);
            return ResponseEntity.ok(ApiResponse.success(donHang));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi hủy đơn hàng: " + e.getMessage()));
        }
    }

    // ==================== SOFT DELETE ENDPOINTS ====================

    /**
     * GET /donhang/deleted - Get list of soft-deleted orders
     *
     * Retrieves all orders that have been soft-deleted (da_xoa = true).
     * Includes the deletedAt timestamp for each order.
     * Supports the same filtering and sorting capabilities as the main list
     * endpoint.
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
     * - sort: Sort by field (ngayDat, tongGia, trangThai, pnr) with optional
     * direction (field:asc or field:desc)
     * Default sort: ngayDat:desc
     *
     * @return List of soft-deleted orders matching the filter criteria
     */
    @GetMapping("/deleted")
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<ApiResponse<List<DonHangResponse>>> getDeletedDonHang(
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String soDienThoai,
            @RequestParam(required = false) String pnr,
            @RequestParam(required = false) LocalDateTime tuNgay,
            @RequestParam(required = false) LocalDateTime denNgay,
            @RequestParam(required = false) String tuGia,
            @RequestParam(required = false) String denGia,
            @RequestParam(required = false) String sort) {
        try {
            List<DonHangResponse> deletedDonHangList = donHangService.getDeletedDonHang(
                    trangThai,
                    email,
                    soDienThoai,
                    pnr,
                    tuNgay,
                    denNgay,
                    tuGia != null ? new BigDecimal(tuGia) : null,
                    denGia != null ? new BigDecimal(denGia) : null,
                    sort);
            return ResponseEntity.ok(ApiResponse.success(deletedDonHangList));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách đơn hàng đã xóa: " + e.getMessage()));
        }
    }

    /**
     * PUT /donhang/{id}/restore - Restore soft-deleted order
     *
     * Restores an order that has been soft-deleted (da_xoa = true).
     * The order will be visible again in the main order list.
     * Validation rules:
     * - Order must be currently soft-deleted (da_xoa = true)
     * - Clears the da_xoa and deleted_at fields
     *
     * @param id Order ID (madonhang)
     * @return Success message confirming restoration
     */
    @PutMapping("/{id}/restore")
    @RequirePermission(feature = "ORDER", action = "RESTORE")
    public ResponseEntity<ApiResponse<Void>> restoreDonHang(@PathVariable int id) {
        try {
            donHangService.restoreDonHang(id);
            return ResponseEntity.ok(ApiResponse.successMessage("Khôi phục đơn hàng thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi khôi phục đơn hàng: " + e.getMessage()));
        }
    }

    /**
     * DELETE /donhang/{id} - Soft delete order
     *
     * Soft deletes an order (sets da_xoa = true, deleted_at = now).
     * The order will no longer appear in the main order list but can be restored.
     * Validation rules:
     * - Order must exist
     * - Cannot delete paid orders (status = ĐÃ THANH TOÁN)
     *
     * @param id Order ID (madonhang)
     * @return Success message confirming soft deletion
     */
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "ORDER", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> softDeleteDonHang(@PathVariable int id) {
        try {
            donHangService.softDeleteDonHang(id);
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa đơn hàng thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi xóa đơn hàng: " + e.getMessage()));
        }
    }

    // ==================== BATCH OPERATIONS ENDPOINTS ====================

    /**
     * POST /donhang/batch/approve - Batch approve payment for multiple orders
     *
     * Approves payment for multiple orders at once with validation:
     * - Only orders with status CHỜ THANH TOÁN will be processed
     * - Validates flight status (cannot approve if flight is already completed)
     *
     * @param request Request body containing list of order IDs
     * @return Result of batch approval operation
     */
    @PostMapping("/batch/approve")
    @RequirePermission(feature = "ORDER", action = "APPROVE")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> batchApprovePayment(
            @Valid @RequestBody BatchApproveRequest request) {
        try {
            java.util.Map<String, Object> result = donHangService.batchApprovePayment(request.getMaDonHangs());
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi duyệt thanh toán hàng loạt: " + e.getMessage()));
        }
    }

    /**
     * POST /donhang/batch/refund - Batch refund for multiple orders
     *
     * Refunds multiple orders at once with validation:
     * - Only orders with status ĐÃ THANH TOÁN will be processed
     * - Cannot refund if flight status is ĐÃ BAY or ĐANG BAY
     *
     * @param request Request body containing list of order IDs and refund reason
     * @return Result of batch refund operation
     */
    @PostMapping("/batch/refund")
    @RequirePermission(feature = "ORDER", action = "CANCEL")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> batchRefund(
            @Valid @RequestBody BatchRefundRequest request) {
        try {
            java.util.Map<String, Object> result = donHangService.batchRefund(
                    request.getMaDonHangs(),
                    request.getLyDoHoanTien());
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi hoàn tiền hàng loạt: " + e.getMessage()));
        }
    }
}
