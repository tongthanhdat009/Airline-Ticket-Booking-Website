package com.example.j2ee.controller.publicapi;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.TuyenBay;
import com.example.j2ee.service.TuyenBayService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public API Controller for Routes
 * Base URL: /api/v1/routes
 * 
 * Provides public read-only access to route data for dropdowns and lookups.
 * No authentication required.
 */
@RestController
@RequestMapping("/api/v1/routes")
public class RouteController {

    private final TuyenBayService tuyenBayService;

    public RouteController(TuyenBayService tuyenBayService) {
        this.tuyenBayService = tuyenBayService;
    }

    /**
     * GET /api/v1/routes - Get all routes
     * 
     * @return List of all routes
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TuyenBay>>> getAllRoutes() {
        List<TuyenBay> routes = tuyenBayService.getAllTuyenBay();
        return ResponseEntity.ok(ApiResponse.success(routes));
    }
}
