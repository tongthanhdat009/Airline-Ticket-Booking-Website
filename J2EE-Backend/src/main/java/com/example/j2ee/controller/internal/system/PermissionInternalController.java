package com.example.j2ee.controller.internal.system;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.phanquyen.*;
import com.example.j2ee.model.PhanQuyen;
import com.example.j2ee.service.PhanQuyenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Internal API Controller for Permission Management (RBAC)
 * Base URL: /internal/permissions
 * 
 * Provides internal/admin APIs for role-based access control.
 * JWT Authentication Required.
 * 
 * NOTE: Cannot modify SUPER_ADMIN role permissions.
 */
@RestController
@RequestMapping("/internal/permissions")
@RequiredArgsConstructor
@Slf4j
public class PermissionInternalController {

    private final PhanQuyenService phanQuyenService;

    // ==================== FEATURES & ACTIONS ====================

    /**
     * GET /internal/permissions/features - Get all features
     */
    @GetMapping("/features")
    @RequirePermission(feature = "PERMISSION", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ChucNangDTO>>> getAllFeatures() {
        List<ChucNangDTO> features = phanQuyenService.getAllChucNang();
        return ResponseEntity.ok(ApiResponse.success(features));
    }

    /**
     * GET /internal/permissions/features/grouped - Get features grouped by category
     */
    @GetMapping("/features/grouped")
    @RequirePermission(feature = "PERMISSION", action = "VIEW")
    public ResponseEntity<ApiResponse<Map<String, List<ChucNangDTO>>>> getFeaturesGrouped() {
        Map<String, List<ChucNangDTO>> grouped = phanQuyenService.getAllChucNangGrouped();
        return ResponseEntity.ok(ApiResponse.success(grouped));
    }

    /**
     * GET /internal/permissions/actions - Get all actions
     */
    @GetMapping("/actions")
    @RequirePermission(feature = "PERMISSION", action = "VIEW")
    public ResponseEntity<ApiResponse<List<HanhDongDTO>>> getAllActions() {
        List<HanhDongDTO> actions = phanQuyenService.getAllHanhDong();
        return ResponseEntity.ok(ApiResponse.success(actions));
    }

    // ==================== ROLES ====================

    /**
     * GET /internal/permissions/roles - Get all roles with SUPER_ADMIN flag
     */
    @GetMapping("/roles")
    @RequirePermission(feature = "PERMISSION", action = "VIEW")
    public ResponseEntity<ApiResponse<List<PhanQuyenResponse.VaiTroInfo>>> getAllRoles() {
        List<PhanQuyenResponse.VaiTroInfo> roles = phanQuyenService.getAllVaiTroWithSuperAdminFlag();
        return ResponseEntity.ok(ApiResponse.success(roles));
    }

    /**
     * GET /internal/permissions/roles/{roleId} - Get permissions by role
     */
    @GetMapping("/roles/{roleId}")
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
     * GET /internal/permissions/roles/{roleId}/matrix - Get permission matrix for role
     * Returns map with key "featureId-actionCode", value true/false
     */
    @GetMapping("/roles/{roleId}/matrix")
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

    // ==================== UPDATE PERMISSIONS ====================

    /**
     * PUT /internal/permissions/roles - Update role permissions
     * 
     * Request body:
     * {
     *   "maVaiTro": 2,
     *   "permissions": [
     *     { "maChucNang": 1, "maHanhDong": "VIEW" },
     *     { "maChucNang": 1, "maHanhDong": "CREATE" }
     *   ]
     * }
     * 
     * NOTE: Cannot modify SUPER_ADMIN role permissions.
     */
    @PutMapping("/roles")
    @RequirePermission(feature = "PERMISSION", action = "UPDATE")
    public ResponseEntity<ApiResponse<PhanQuyenResponse>> updateRolePermissions(
            @RequestBody PhanQuyenRequest request) {
        try {
            PhanQuyenResponse response = phanQuyenService.updatePhanQuyen(request);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật phân quyền thành công", response));
        } catch (IllegalArgumentException e) {
            log.warn("Error updating permissions: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Server error updating permissions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * POST /internal/permissions/roles/{roleId} - Add permission to role
     * 
     * @param roleId Role ID
     * @param featureId Feature ID (maChucNang)
     * @param actionCode Action code (VIEW, CREATE, UPDATE, DELETE, ...)
     * 
     * NOTE: Cannot modify SUPER_ADMIN role permissions.
     */
    @PostMapping("/roles/{roleId}")
    @RequirePermission(feature = "PERMISSION", action = "UPDATE")
    public ResponseEntity<ApiResponse<PhanQuyen>> addPermission(
            @PathVariable int roleId,
            @RequestParam int featureId,
            @RequestParam String actionCode) {
        try {
            PhanQuyen permission = phanQuyenService.addPermission(roleId, featureId, actionCode);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Thêm quyền thành công", permission));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Server error adding permission", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * DELETE /internal/permissions/roles/{roleId} - Remove permission from role
     * 
     * @param roleId Role ID
     * @param featureId Feature ID (maChucNang)
     * @param actionCode Action code
     * 
     * NOTE: Cannot modify SUPER_ADMIN role permissions.
     */
    @DeleteMapping("/roles/{roleId}")
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
            log.error("Server error removing permission", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * POST /internal/permissions/copy - Copy permissions from one role to another
     * 
     * @param fromRoleId Source role ID
     * @param toRoleId Target role ID
     * 
     * NOTE: Cannot copy to SUPER_ADMIN role.
     */
    @PostMapping("/copy")
    @RequirePermission(feature = "PERMISSION", action = "UPDATE")
    public ResponseEntity<ApiResponse<PhanQuyenResponse>> copyPermissions(
            @RequestParam int fromRoleId,
            @RequestParam int toRoleId) {
        try {
            PhanQuyenResponse response = phanQuyenService.copyPermissions(fromRoleId, toRoleId);
            return ResponseEntity.ok(ApiResponse.success("Sao chép phân quyền thành công", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Server error copying permissions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi server: " + e.getMessage()));
        }
    }
}
