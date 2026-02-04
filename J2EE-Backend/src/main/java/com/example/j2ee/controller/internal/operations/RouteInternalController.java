package com.example.j2ee.controller.internal.operations;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.TuyenBay;
import com.example.j2ee.service.TuyenBayService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Internal API Controller for Route Management
 * Base URL: /internal/routes
 * 
 * Provides internal/admin APIs for route management.
 * JWT Authentication Required.
 */
@RestController
@RequestMapping("/internal/routes")
public class RouteInternalController {

    private final TuyenBayService tuyenBayService;

    public RouteInternalController(TuyenBayService tuyenBayService) {
        this.tuyenBayService = tuyenBayService;
    }

    // ==================== READ ENDPOINTS ====================

    /**
     * GET /internal/routes - Get all routes
     */
    @GetMapping
    @RequirePermission(feature = "ROUTE", action = "VIEW")
    public ResponseEntity<ApiResponse<List<TuyenBay>>> getAllRoutes() {
        List<TuyenBay> routes = tuyenBayService.getAllTuyenBay();
        return ResponseEntity.ok(ApiResponse.success(routes));
    }

    /**
     * GET /internal/routes/{id} - Get route by ID
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "ROUTE", action = "VIEW")
    public ResponseEntity<ApiResponse<TuyenBay>> getRouteById(@PathVariable int id) {
        TuyenBay route = tuyenBayService.getTuyenBayById(id);
        if (route == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy tuyến bay"));
        }
        return ResponseEntity.ok(ApiResponse.success(route));
    }

    // ==================== CREATE ENDPOINTS ====================

    /**
     * POST /internal/routes - Create new route
     */
    @PostMapping
    @RequirePermission(feature = "ROUTE", action = "CREATE")
    public ResponseEntity<ApiResponse<TuyenBay>> createRoute(@RequestBody TuyenBay route) {
        TuyenBay created = tuyenBayService.createTuyenBay(route);
        if (created == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(
                            "Dữ liệu không hợp lệ hoặc sân bay không tồn tại/trùng nhau hoặc tuyến bay đã tồn tại"));
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo tuyến bay thành công", created));
    }

    // ==================== UPDATE ENDPOINTS ====================

    /**
     * PUT /internal/routes/{id} - Update route
     */
    @PutMapping("/{id}")
    @RequirePermission(feature = "ROUTE", action = "UPDATE")
    public ResponseEntity<ApiResponse<Void>> updateRoute(
            @PathVariable int id,
            @RequestBody TuyenBay route) {
        route.setMaTuyenBay(id);
        String error = tuyenBayService.updateTuyenBay(route);
        if (error == null) {
            return ResponseEntity.ok(ApiResponse.successMessage("Sửa thông tin tuyến bay thành công"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(error));
        }
    }

    // ==================== DELETE ENDPOINTS ====================

    /**
     * DELETE /internal/routes/{id} - Delete route
     */
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "ROUTE", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteRoute(@PathVariable int id) {
        String error = tuyenBayService.deleteTuyenBay(id);
        if (error == null) {
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa tuyến bay thành công"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(error));
        }
    }
}
