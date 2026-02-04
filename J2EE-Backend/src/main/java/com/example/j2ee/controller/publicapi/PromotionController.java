package com.example.j2ee.controller.publicapi;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.khuyenmai.KhuyenMaiResponse;
import com.example.j2ee.service.KhuyenMaiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public API Controller for Promotions
 * Base URL: /api/v1/promotions
 * 
 * Provides public read-only access to promotions data.
 * No authentication required.
 */
@RestController
@RequestMapping("/api/v1/promotions")
public class PromotionController {

    private final KhuyenMaiService khuyenMaiService;

    public PromotionController(KhuyenMaiService khuyenMaiService) {
        this.khuyenMaiService = khuyenMaiService;
    }

    /**
     * GET /api/v1/promotions - Get all promotions
     * 
     * @return List of all promotions
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<KhuyenMaiResponse>>> getAllPromotions() {
        List<KhuyenMaiResponse> promotions = khuyenMaiService.findAll();
        return ResponseEntity.ok(ApiResponse.success(promotions));
    }

    /**
     * GET /api/v1/promotions/{id} - Get promotion by ID
     * 
     * @param id Promotion ID
     * @return Promotion details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<KhuyenMaiResponse>> getPromotionById(@PathVariable Integer id) {
        try {
            KhuyenMaiResponse promotion = khuyenMaiService.findById(id);
            return ResponseEntity.ok(ApiResponse.success(promotion));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
