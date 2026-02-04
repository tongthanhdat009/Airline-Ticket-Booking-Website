package com.example.j2ee.controller.publicapi;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.DichVuCungCap;
import com.example.j2ee.service.DichVuCungCapService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public API Controller for Services
 * Base URL: /api/v1/services
 * 
 * Provides public read-only access to services data for dropdowns and lookups.
 * No authentication required.
 */
@RestController
@RequestMapping("/api/v1/services")
public class ServiceController {

    private final DichVuCungCapService dichVuCungCapService;

    public ServiceController(DichVuCungCapService dichVuCungCapService) {
        this.dichVuCungCapService = dichVuCungCapService;
    }

    /**
     * GET /api/v1/services - Get all services
     * 
     * @return List of all services
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DichVuCungCap>>> getAllServices() {
        List<DichVuCungCap> services = dichVuCungCapService.getAllDichVuCungCap();
        return ResponseEntity.ok(ApiResponse.success(services));
    }
}
