package com.example.j2ee.controller.publicapi;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.VaiTro;
import com.example.j2ee.service.VaiTroService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public API Controller for Roles
 * Base URL: /api/v1/roles
 * 
 * Provides public read-only access to role data for dropdowns.
 * No authentication required.
 */
@RestController
@RequestMapping("/api/v1/roles")
public class RoleController {

    private final VaiTroService vaiTroService;

    public RoleController(VaiTroService vaiTroService) {
        this.vaiTroService = vaiTroService;
    }

    /**
     * GET /api/v1/roles - Get all roles
     * 
     * @return List of all roles
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<VaiTro>>> getAllRoles() {
        List<VaiTro> roles = vaiTroService.getAllVaiTro();
        return ResponseEntity.ok(ApiResponse.success(roles));
    }
}
