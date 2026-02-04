package com.example.j2ee.controller.publicapi;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.GiaChuyenBay;
import com.example.j2ee.repository.GiaChuyenBayRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public API Controller for Prices
 * Base URL: /api/v1/prices
 * 
 * Provides public read-only access to flight prices.
 * No authentication required.
 */
@RestController
@RequestMapping("/api/v1/prices")
public class PriceController {

    private final GiaChuyenBayRepository giaChuyenBayRepository;

    public PriceController(GiaChuyenBayRepository giaChuyenBayRepository) {
        this.giaChuyenBayRepository = giaChuyenBayRepository;
    }

    /**
     * GET /api/v1/prices/routes/{routeId} - Get prices by route
     * 
     * @param routeId Route ID
     * @return List of prices for the route
     */
    @GetMapping("/routes/{routeId}")
    public ResponseEntity<ApiResponse<List<GiaChuyenBay>>> getPricesByRoute(@PathVariable Integer routeId) {
        List<GiaChuyenBay> prices = giaChuyenBayRepository.findByTuyenBay_MaTuyenBay(routeId);
        return ResponseEntity.ok(ApiResponse.success(prices));
    }
}
