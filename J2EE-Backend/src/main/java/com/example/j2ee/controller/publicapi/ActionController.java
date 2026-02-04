package com.example.j2ee.controller.publicapi;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.phanquyen.HanhDongDTO;
import com.example.j2ee.service.PhanQuyenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public API Controller for Actions (Hành động)
 * Base URL: /api/v1/actions
 * 
 * Provides public read-only access to actions data for permission system.
 * No authentication required.
 */
@RestController
@RequestMapping("/api/v1/actions")
public class ActionController {

    private final PhanQuyenService phanQuyenService;

    public ActionController(PhanQuyenService phanQuyenService) {
        this.phanQuyenService = phanQuyenService;
    }

    /**
     * GET /api/v1/actions - Get all actions
     * 
     * @return List of all actions
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<HanhDongDTO>>> getAllActions() {
        List<HanhDongDTO> actions = phanQuyenService.getAllHanhDong();
        return ResponseEntity.ok(ApiResponse.success(actions));
    }
}
