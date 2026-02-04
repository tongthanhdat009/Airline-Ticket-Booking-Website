package com.example.j2ee.controller.internal.system;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.TaiKhoanAdminDTO;
import com.example.j2ee.model.TaiKhoanAdmin;
import com.example.j2ee.service.TaiKhoanAdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Internal API Controller for Admin User Management
 * Base URL: /internal/admin-users
 * 
 * Provides internal/admin APIs for admin user management.
 * JWT Authentication Required.
 */
@RestController
@RequestMapping("/internal/admin-users")
public class AdminUserInternalController {

    private final TaiKhoanAdminService taiKhoanAdminService;

    public AdminUserInternalController(TaiKhoanAdminService taiKhoanAdminService) {
        this.taiKhoanAdminService = taiKhoanAdminService;
    }

    // ==================== READ ENDPOINTS ====================

    /**
     * GET /internal/admin-users - Get all admin users
     */
    @GetMapping
    @RequirePermission(feature = "USER", action = "VIEW")
    public ResponseEntity<ApiResponse<List<TaiKhoanAdminDTO>>> getAllAdminUsers() {
        List<TaiKhoanAdminDTO> adminUsers = taiKhoanAdminService.getAllTaiKhoan();
        return ResponseEntity.ok(ApiResponse.success(adminUsers));
    }

    /**
     * GET /internal/admin-users/{id} - Get admin user by ID
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "USER", action = "VIEW")
    public ResponseEntity<ApiResponse<TaiKhoanAdmin>> getAdminUserById(@PathVariable int id) {
        return taiKhoanAdminService.getTaiKhoanById(id)
                .map(user -> ResponseEntity.ok(ApiResponse.success(user)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy tài khoản")));
    }

    /**
     * GET /internal/admin-users/search - Search admin users
     */
    @GetMapping("/search")
    @RequirePermission(feature = "USER", action = "VIEW")
    public ResponseEntity<ApiResponse<List<TaiKhoanAdmin>>> searchAdminUsers(
            @RequestParam(required = false) String tenDangNhap,
            @RequestParam(required = false) String email) {
        List<TaiKhoanAdmin> results = taiKhoanAdminService.searchTaiKhoan(tenDangNhap, email);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    // ==================== CREATE ENDPOINTS ====================

    /**
     * POST /internal/admin-users - Create new admin user
     */
    @PostMapping
    @Transactional
    @RequirePermission(feature = "USER", action = "CREATE")
    public ResponseEntity<ApiResponse<TaiKhoanAdmin>> createAdminUser(@RequestBody Map<String, Object> payload) {
        try {
            TaiKhoanAdmin taiKhoanAdmin = new TaiKhoanAdmin();
            taiKhoanAdmin.setTenDangNhap((String) payload.get("tenDangNhap"));
            taiKhoanAdmin.setEmail((String) payload.get("email"));
            taiKhoanAdmin.setHoVaTen((String) payload.get("hoVaTen"));
            taiKhoanAdmin.setMatKhauBam((String) payload.get("matKhauBam"));

            @SuppressWarnings("unchecked")
            List<Integer> vaiTroIds = (List<Integer>) payload.get("vaiTro");

            TaiKhoanAdmin created = taiKhoanAdminService.createTaiKhoan(taiKhoanAdmin);

            if (vaiTroIds != null && !vaiTroIds.isEmpty()) {
                taiKhoanAdminService.assignRolesToAccount(created.getMaTaiKhoan(), vaiTroIds);
            }

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Tạo tài khoản thành công", created));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== UPDATE ENDPOINTS ====================

    /**
     * PUT /internal/admin-users/{id} - Update admin user
     */
    @PutMapping("/{id}")
    @RequirePermission(feature = "USER", action = "UPDATE")
    public ResponseEntity<ApiResponse<TaiKhoanAdmin>> updateAdminUser(
            @PathVariable int id,
            @RequestBody TaiKhoanAdmin taiKhoanAdmin) {
        try {
            taiKhoanAdminService.getTaiKhoanById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Tài khoản không tồn tại"));
            TaiKhoanAdmin updated = taiKhoanAdminService.updateTaiKhoan(id, taiKhoanAdmin);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật tài khoản thành công", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * PUT /internal/admin-users/{id}/roles - Assign roles to admin user
     */
    @PutMapping("/{id}/roles")
    @RequirePermission(feature = "USER", action = "UPDATE")
    public ResponseEntity<ApiResponse<Void>> assignRoles(
            @PathVariable int id,
            @RequestBody Map<String, List<Integer>> request) {
        try {
            List<Integer> vaiTroIds = request.get("vaiTroIds");
            taiKhoanAdminService.assignRolesToAccount(id, vaiTroIds);
            return ResponseEntity.ok(ApiResponse.successMessage("Gán vai trò thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * POST /internal/admin-users/{id}/roles/{roleId} - Add single role to admin user
     */
    @PostMapping("/{id}/roles/{roleId}")
    @RequirePermission(feature = "USER", action = "UPDATE")
    public ResponseEntity<ApiResponse<Void>> addRole(
            @PathVariable int id,
            @PathVariable int roleId) {
        try {
            taiKhoanAdminService.addRoleToAccount(id, roleId);
            return ResponseEntity.ok(ApiResponse.successMessage("Thêm vai trò thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * DELETE /internal/admin-users/{id}/roles/{roleId} - Remove single role from admin user
     */
    @DeleteMapping("/{id}/roles/{roleId}")
    @RequirePermission(feature = "USER", action = "UPDATE")
    public ResponseEntity<ApiResponse<Void>> removeRole(
            @PathVariable int id,
            @PathVariable int roleId) {
        try {
            taiKhoanAdminService.removeRoleFromAccount(id, roleId);
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa vai trò thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi server: " + e.getMessage()));
        }
    }

    // ==================== DELETE ENDPOINTS ====================

    /**
     * DELETE /internal/admin-users/{id} - Delete admin user
     */
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "USER", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteAdminUser(@PathVariable int id) {
        try {
            taiKhoanAdminService.deleteTaiKhoan(id);
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa tài khoản thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
