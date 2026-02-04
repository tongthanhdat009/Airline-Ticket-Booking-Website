package com.example.j2ee.controller.publicapi;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.phanquyen.ChucNangDTO;
import com.example.j2ee.service.PhanQuyenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Public API Controller for Features (Chức năng)
 * Base URL: /api/v1/features
 * 
 * Provides public read-only access to features data for permission system.
 * No authentication required.
 */
@RestController
@RequestMapping("/api/v1/features")
public class FeatureController {

    private final PhanQuyenService phanQuyenService;

    public FeatureController(PhanQuyenService phanQuyenService) {
        this.phanQuyenService = phanQuyenService;
    }

    /**
     * GET /api/v1/features - Get all features
     * 
     * @return List of all features
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ChucNangDTO>>> getAllFeatures() {
        List<ChucNangDTO> features = phanQuyenService.getAllChucNang();
        return ResponseEntity.ok(ApiResponse.success(features));
    }

    /**
     * GET /api/v1/features/grouped - Get all features grouped by category
     * 
     * @return Map of features grouped by category
     */
    @GetMapping("/grouped")
    public ResponseEntity<ApiResponse<Map<String, List<ChucNangDTO>>>> getAllFeaturesGrouped() {
        Map<String, List<ChucNangDTO>> features = phanQuyenService.getAllChucNangGrouped();
        return ResponseEntity.ok(ApiResponse.success(features));
    }
}
