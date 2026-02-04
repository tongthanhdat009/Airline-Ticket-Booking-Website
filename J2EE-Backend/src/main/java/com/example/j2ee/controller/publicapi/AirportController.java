package com.example.j2ee.controller.publicapi;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.SanBay;
import com.example.j2ee.service.SanBayService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public API Controller for Airports
 * Base URL: /api/v1/airports
 * 
 * Provides public read-only access to airport data for dropdowns and lookups.
 * No authentication required.
 */
@RestController
@RequestMapping("/api/v1/airports")
public class AirportController {

    private final SanBayService sanBayService;

    public AirportController(SanBayService sanBayService) {
        this.sanBayService = sanBayService;
    }

    /**
     * GET /api/v1/airports - Get all airports
     * 
     * @return List of all airports
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SanBay>>> getAllAirports() {
        List<SanBay> airports = sanBayService.getAllSanBay();
        return ResponseEntity.ok(ApiResponse.success(airports));
    }

    /**
     * GET /api/v1/airports/active - Get active airports only
     * 
     * @return List of active airports
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<SanBay>>> getActiveAirports() {
        List<SanBay> airports = sanBayService.getActiveSanBay();
        return ResponseEntity.ok(ApiResponse.success(airports));
    }
}
