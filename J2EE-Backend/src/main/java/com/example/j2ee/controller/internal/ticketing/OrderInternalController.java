package com.example.j2ee.controller.internal.ticketing;

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
import java.util.Map;

/**
 * Internal API Controller for Order Management
 * Base URL: /internal/orders
 * 
 * Provides internal/admin APIs for order management.
 * JWT Authentication Required.
 */
@RestController
@RequestMapping("/internal/orders")
public class OrderInternalController {

    private final DonHangService donHangService;

    public OrderInternalController(DonHangService donHangService) {
        this.donHangService = donHangService;
    }

    // ==================== READ ENDPOINTS ====================

    /**
     * GET /internal/orders - List orders with filters and sorting
     */
    @GetMapping
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<ApiResponse<List<DonHangResponse>>> getAllOrders(
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
            List<DonHangResponse> orderList = donHangService.getAllDonHang(
                    trangThai,
                    email,
                    soDienThoai,
                    pnr,
                    tuNgay,
                    denNgay,
                    tuGia != null ? new BigDecimal(tuGia) : null,
                    denGia != null ? new BigDecimal(denGia) : null,
                    sort);
            return ResponseEntity.ok(ApiResponse.success(orderList));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách đơn hàng: " + e.getMessage()));
        }
    }

    /**
     * GET /internal/orders/{id} - Get order details by ID
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<ApiResponse<DonHangDetailResponse>> getOrderById(@PathVariable int id) {
        try {
            DonHangDetailResponse order = donHangService.getDonHangById(id);
            return ResponseEntity.ok(ApiResponse.success(order));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thông tin đơn hàng: " + e.getMessage()));
        }
    }

    /**
     * GET /internal/orders/pnr/{pnr} - Find order by PNR code
     */
    @GetMapping("/pnr/{pnr}")
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<ApiResponse<DonHangDetailResponse>> getOrderByPnr(@PathVariable String pnr) {
        try {
            DonHangDetailResponse order = donHangService.getDonHangByPnr(pnr);
            return ResponseEntity.ok(ApiResponse.success(order));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi tìm đơn hàng theo PNR: " + e.getMessage()));
        }
    }

    /**
     * GET /internal/orders/deleted - Get soft-deleted orders
     */
    @GetMapping("/deleted")
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<ApiResponse<List<DonHangResponse>>> getDeletedOrders(
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
            List<DonHangResponse> deletedOrders = donHangService.getDeletedDonHang(
                    trangThai,
                    email,
                    soDienThoai,
                    pnr,
                    tuNgay,
                    denNgay,
                    tuGia != null ? new BigDecimal(tuGia) : null,
                    denGia != null ? new BigDecimal(denGia) : null,
                    sort);
            return ResponseEntity.ok(ApiResponse.success(deletedOrders));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách đơn hàng đã xóa: " + e.getMessage()));
        }
    }

    // ==================== UPDATE ENDPOINTS ====================

    /**
     * PATCH /internal/orders/{id}/status - Update order status
     */
    @PatchMapping("/{id}/status")
    @RequirePermission(feature = "ORDER", action = "UPDATE")
    public ResponseEntity<ApiResponse<DonHangResponse>> updateOrderStatus(
            @PathVariable int id,
            @Valid @RequestBody UpdateTrangThaiDonHangRequest request) {
        try {
            DonHangResponse order = donHangService.updateTrangThai(id, request);
            return ResponseEntity.ok(ApiResponse.success(order));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi cập nhật trạng thái đơn hàng: " + e.getMessage()));
        }
    }

    /**
     * PUT /internal/orders/{id}/cancel - Cancel order
     */
    @PutMapping("/{id}/cancel")
    @RequirePermission(feature = "ORDER", action = "CANCEL")
    public ResponseEntity<ApiResponse<DonHangResponse>> cancelOrder(
            @PathVariable int id,
            @Valid @RequestBody HuyDonHangRequest request) {
        try {
            DonHangResponse order = donHangService.huyDonHang(id, request);
            return ResponseEntity.ok(ApiResponse.success(order));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi hủy đơn hàng: " + e.getMessage()));
        }
    }

    /**
     * PUT /internal/orders/{id}/restore - Restore soft-deleted order
     */
    @PutMapping("/{id}/restore")
    @RequirePermission(feature = "ORDER", action = "RESTORE")
    public ResponseEntity<ApiResponse<Void>> restoreOrder(@PathVariable int id) {
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

    // ==================== DELETE ENDPOINTS ====================

    /**
     * DELETE /internal/orders/{id} - Soft delete order
     */
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "ORDER", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> softDeleteOrder(@PathVariable int id) {
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

    // ==================== BATCH OPERATIONS ====================

    /**
     * POST /internal/orders/batch/approve - Batch approve payment
     */
    @PostMapping("/batch/approve")
    @RequirePermission(feature = "ORDER", action = "APPROVE")
    public ResponseEntity<ApiResponse<Map<String, Object>>> batchApprovePayment(
            @Valid @RequestBody BatchApproveRequest request) {
        try {
            Map<String, Object> result = donHangService.batchApprovePayment(request.getMaDonHangs());
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
     * POST /internal/orders/batch/refund - Batch refund
     */
    @PostMapping("/batch/refund")
    @RequirePermission(feature = "ORDER", action = "CANCEL")
    public ResponseEntity<ApiResponse<Map<String, Object>>> batchRefund(
            @Valid @RequestBody BatchRefundRequest request) {
        try {
            Map<String, Object> result = donHangService.batchRefund(
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
