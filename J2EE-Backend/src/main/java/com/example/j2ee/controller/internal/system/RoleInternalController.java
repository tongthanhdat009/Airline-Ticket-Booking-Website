package com.example.j2ee.controller.internal.system;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.phanquyen.*;
import com.example.j2ee.model.PhanQuyen;
import com.example.j2ee.service.PhanQuyenService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Internal API Controller for Role and Permission Management (RBAC)
 * Base URL: /internal/roles
 * 
 * Provides internal/admin APIs for role and permission management.
 * JWT Authentication Required.
 * 
 * NOTE: Cannot modify permissions for SUPER_ADMIN role.
 */
@Slf4j
@RestController
@RequestMapping("/internal/roles")
public class RoleInternalController {

    private final PhanQuyenService phanQuyenService;

    public RoleInternalController(PhanQuyenService phanQuyenService) {
        this.phanQuyenService = phanQuyenService;
    }

    // ==================== ROLE ENDPOINTS ====================

    /**
     * GET /internal/roles - Get all roles with SUPER_ADMIN flag
     */
    @GetMapping
    @RequirePermission(feature = "PERMISSION", action = "VIEW")
    public ResponseEntity<ApiResponse<List<PhanQuyenResponse.VaiTroInfo>>> getAllRoles() {
        List<PhanQuyenResponse.VaiTroInfo> roles = phanQuyenService.getAllVaiTroWithSuperAdminFlag();
        return ResponseEntity.ok(ApiResponse.success(roles));
    }

    /**
     * GET /internal/roles/{roleId}/permissions - Get permissions for a role
     */
    @GetMapping("/{roleId}/permissions")
    @RequirePermission(feature = "PERMISSION", action = "VIEW")
    public ResponseEntity<ApiResponse<PhanQuyenResponse>> getPermissionsByRole(@PathVariable int roleId) {
        try {
            PhanQuyenResponse response = phanQuyenService.getPhanQuyenByVaiTro(roleId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * GET /internal/roles/{roleId}/permissions/matrix - Get permission matrix for a role
     */
    @GetMapping("/{roleId}/permissions/matrix")
    @RequirePermission(feature = "PERMISSION", action = "VIEW")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> getPermissionMatrix(@PathVariable int roleId) {
        try {
            Map<String, Boolean> matrix = phanQuyenService.getPermissionMatrix(roleId);
            return ResponseEntity.ok(ApiResponse.success(matrix));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== UPDATE ENDPOINTS ====================

    /**
     * PUT /internal/roles/{roleId}/permissions - Update permissions for role
     */
    @PutMapping("/{roleId}/permissions")
    @RequirePermission(feature = "PERMISSION", action = "UPDATE")
    public ResponseEntity<ApiResponse<PhanQuyenResponse>> updatePermissions(
            @PathVariable int roleId,
            @RequestBody PhanQuyenRequest request) {
        try {
            // Ensure roleId matches request
            request.setMaVaiTro(roleId);
            PhanQuyenResponse response = phanQuyenService.updatePhanQuyen(request);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật phân quyền thành công", response));
        } catch (IllegalArgumentException e) {
            log.warn("Lỗi cập nhật phân quyền: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Lỗi server khi cập nhật phân quyền", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * POST /internal/roles/{roleId}/permissions - Add single permission to role
     */
    @PostMapping("/{roleId}/permissions")
    @RequirePermission(feature = "PERMISSION", action = "UPDATE")
    public ResponseEntity<ApiResponse<PhanQuyen>> addPermission(
            @PathVariable int roleId,
            @RequestParam int featureId,
            @RequestParam String actionCode) {
        try {
            PhanQuyen pq = phanQuyenService.addPermission(roleId, featureId, actionCode);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Thêm quyền thành công", pq));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Lỗi server khi thêm quyền", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * DELETE /internal/roles/{roleId}/permissions - Remove single permission from role
     */
    @DeleteMapping("/{roleId}/permissions")
    @RequirePermission(feature = "PERMISSION", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> removePermission(
            @PathVariable int roleId,
            @RequestParam int featureId,
            @RequestParam String actionCode) {
        try {
            phanQuyenService.removePermission(roleId, featureId, actionCode);
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa quyền thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Lỗi server khi xóa quyền", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * POST /internal/roles/{roleId}/copy-from/{sourceRoleId} - Copy permissions from another role
     */
    @PostMapping("/{roleId}/copy-from/{sourceRoleId}")
    @RequirePermission(feature = "PERMISSION", action = "UPDATE")
    public ResponseEntity<ApiResponse<PhanQuyenResponse>> copyPermissions(
            @PathVariable int sourceRoleId,
            @PathVariable int roleId) {
        try {
            PhanQuyenResponse response = phanQuyenService.copyPermissions(sourceRoleId, roleId);
            return ResponseEntity.ok(ApiResponse.success("Sao chép phân quyền thành công", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Lỗi server khi sao chép phân quyền", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi server: " + e.getMessage()));
        }
    }

    // ==================== FEATURE ENDPOINTS ====================

    /**
     * GET /internal/roles/features - Get all features
     */
    @GetMapping("/features")
    @RequirePermission(feature = "PERMISSION", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ChucNangDTO>>> getAllFeatures() {
        List<ChucNangDTO> features = phanQuyenService.getAllChucNang();
        return ResponseEntity.ok(ApiResponse.success(features));
    }

    /**
     * GET /internal/roles/features/grouped - Get all features grouped
     */
    @GetMapping("/features/grouped")
    @RequirePermission(feature = "PERMISSION", action = "VIEW")
    public ResponseEntity<ApiResponse<Map<String, List<ChucNangDTO>>>> getAllFeaturesGrouped() {
        Map<String, List<ChucNangDTO>> grouped = phanQuyenService.getAllChucNangGrouped();
        return ResponseEntity.ok(ApiResponse.success(grouped));
    }

    // ==================== ACTION ENDPOINTS ====================

    /**
     * GET /internal/roles/actions - Get all actions
     */
    @GetMapping("/actions")
    @RequirePermission(feature = "PERMISSION", action = "VIEW")
    public ResponseEntity<ApiResponse<List<HanhDongDTO>>> getAllActions() {
        List<HanhDongDTO> actions = phanQuyenService.getAllHanhDong();
        return ResponseEntity.ok(ApiResponse.success(actions));
    }
}
