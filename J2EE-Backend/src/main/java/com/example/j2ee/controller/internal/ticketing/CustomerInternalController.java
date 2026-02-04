package com.example.j2ee.controller.internal.ticketing;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.service.TaiKhoanService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Internal API Controller for Customer Management
 * Base URL: /internal/customers
 * 
 * Provides internal/admin APIs for customer management.
 * JWT Authentication Required.
 */
@RestController
@RequestMapping("/internal/customers")
public class CustomerInternalController {

    private final TaiKhoanService taiKhoanService;

    public CustomerInternalController(TaiKhoanService taiKhoanService) {
        this.taiKhoanService = taiKhoanService;
    }

    // ==================== READ ENDPOINTS ====================

    /**
     * GET /internal/customers - Get all customers
     */
    @GetMapping
    @RequirePermission(feature = "CUSTOMER", action = "VIEW")
    public ResponseEntity<ApiResponse<List<TaiKhoan>>> getAllCustomers() {
        List<TaiKhoan> list = taiKhoanService.getAllTaiKhoan();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tài khoản thành công", list));
    }

    /**
     * GET /internal/customers/{id} - Get customer by ID
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "CUSTOMER", action = "VIEW")
    public ResponseEntity<ApiResponse<TaiKhoan>> getCustomerById(@PathVariable int id) {
        TaiKhoan customer = taiKhoanService.getTaiKhoanById(id);
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy tài khoản với id: " + id));
        }
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin tài khoản thành công", customer));
    }

    // ==================== UPDATE ENDPOINTS ====================

    /**
     * PUT /internal/customers/{id} - Update customer
     */
    @PutMapping("/{id}")
    @RequirePermission(feature = "CUSTOMER", action = "UPDATE")
    public ResponseEntity<ApiResponse<TaiKhoan>> updateCustomer(
            @PathVariable int id,
            @RequestBody TaiKhoan updated) {
        TaiKhoan saved = taiKhoanService.updateTaiKhoan(id, updated);
        if (saved == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy tài khoản với id: " + id));
        }
        return ResponseEntity.ok(ApiResponse.success("Cập nhật tài khoản thành công", saved));
    }

    // ==================== DELETE ENDPOINTS ====================

    /**
     * DELETE /internal/customers/{id} - Delete customer
     */
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "CUSTOMER", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable int id) {
        boolean ok = taiKhoanService.deleteTaiKhoan(id);
        if (!ok) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy tài khoản với id: " + id));
        }
        return ResponseEntity.ok(ApiResponse.successMessage("Xoá tài khoản thành công"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
    }
}
