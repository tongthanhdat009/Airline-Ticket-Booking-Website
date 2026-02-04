package com.example.j2ee.controller.internal.ticketing;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.ChuyenBayKhachHangDTO;
import com.example.j2ee.model.HanhKhach;
import com.example.j2ee.service.HanhKhachService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

/**
 * Internal API Controller for Passenger Management
 * Base URL: /internal/passengers
 * 
 * Provides internal/admin APIs for managing passengers.
 * JWT Authentication Required.
 */
@RestController
@RequestMapping("/internal/passengers")
public class PassengerInternalController {

    private final HanhKhachService hanhKhachService;

    public PassengerInternalController(HanhKhachService hanhKhachService) {
        this.hanhKhachService = hanhKhachService;
    }

    // ==================== READ ENDPOINTS ====================

    /**
     * GET /internal/passengers - Get all passengers
     */
    @GetMapping
    @RequirePermission(feature = "CUSTOMER", action = "VIEW")
    public ResponseEntity<ApiResponse<List<HanhKhach>>> getAllPassengers() {
        List<HanhKhach> passengers = hanhKhachService.getAllHanhKhach();
        return ResponseEntity.ok(ApiResponse.success(passengers));
    }

    /**
     * GET /internal/passengers/{id} - Get passenger by ID
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "CUSTOMER", action = "VIEW")
    public ResponseEntity<ApiResponse<HanhKhach>> getPassengerById(@PathVariable int id) {
        Optional<HanhKhach> passenger = hanhKhachService.getHanhKhachById(id);
        return passenger
                .map(hk -> ResponseEntity.ok(ApiResponse.success(hk)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy hành khách với id: " + id)));
    }

    /**
     * GET /internal/passengers/{id}/flights - Get passenger's flights
     */
    @GetMapping("/{id}/flights")
    @RequirePermission(feature = "CUSTOMER", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ChuyenBayKhachHangDTO>>> getPassengerFlights(@PathVariable int id) {
        try {
            List<ChuyenBayKhachHangDTO> flights = hanhKhachService.getChuyenBayByKhachHang(id);
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách chuyến bay thành công", flights));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách chuyến bay: " + ex.getMessage()));
        }
    }

    // ==================== CREATE ENDPOINTS ====================

    /**
     * POST /internal/passengers - Create new passenger
     */
    @PostMapping
    @RequirePermission(feature = "CUSTOMER", action = "CREATE")
    public ResponseEntity<ApiResponse<HanhKhach>> createPassenger(@RequestBody HanhKhach body) {
        try {
            HanhKhach created = hanhKhachService.createHanhKhach(body);
            return ResponseEntity.created(URI.create("/internal/passengers/" + created.getMaHanhKhach()))
                    .body(ApiResponse.success("Tạo hành khách thành công", created));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(ex.getMessage()));
        }
    }

    // ==================== UPDATE ENDPOINTS ====================

    /**
     * PUT /internal/passengers/{id} - Update passenger
     */
    @PutMapping("/{id}")
    @RequirePermission(feature = "CUSTOMER", action = "UPDATE")
    public ResponseEntity<ApiResponse<HanhKhach>> updatePassenger(
            @PathVariable int id,
            @RequestBody HanhKhach body) {
        try {
            Optional<HanhKhach> updated = hanhKhachService.updateHanhKhach(id, body);
            return updated
                    .map(hk -> ResponseEntity.ok(ApiResponse.success("Cập nhật hành khách thành công", hk)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.error("Không tìm thấy hành khách với id: " + id)));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(ex.getMessage()));
        }
    }

    // ==================== DELETE ENDPOINTS ====================

    /**
     * DELETE /internal/passengers/{id} - Delete passenger
     */
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "CUSTOMER", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deletePassenger(@PathVariable int id) {
        boolean deleted = hanhKhachService.deleteHanhKhach(id);
        if (deleted) {
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa hành khách thành công"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Không tìm thấy hành khách với id: " + id));
    }
}
