package com.example.j2ee.controller;

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

@RestController
@RequestMapping("/admin/dashboard/tkadmin")
public class QuanLyTaiKhoanAdminController {
    private final TaiKhoanAdminService taiKhoanAdminService;

    public QuanLyTaiKhoanAdminController(TaiKhoanAdminService taiKhoanAdminService) {
        this.taiKhoanAdminService = taiKhoanAdminService;
    }

    @GetMapping
    @RequirePermission(feature = "USER", action = "VIEW")
    public ResponseEntity<ApiResponse<List<TaiKhoanAdminDTO>>> getAllTaiKhoan() {
        List<TaiKhoanAdminDTO> taiKhoanAdminList = taiKhoanAdminService.getAllTaiKhoan();
        return ResponseEntity.ok(ApiResponse.success(taiKhoanAdminList));
    }

    @GetMapping("/{id}")
    @RequirePermission(feature = "USER", action = "VIEW")
    public ResponseEntity<ApiResponse<TaiKhoanAdmin>> getTaiKhoanById(@PathVariable int id) {
        return taiKhoanAdminService.getTaiKhoanById(id)
                .map(taiKhoan -> ResponseEntity.ok(ApiResponse.success(taiKhoan)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy tài khoản")));
    }

    @PostMapping
    @Transactional
    @RequirePermission(feature = "USER", action = "CREATE")
    public ResponseEntity<ApiResponse<TaiKhoanAdmin>> createTaiKhoan(@RequestBody Map<String, Object> payload) {
        try {
            // Extract tài khoản admin từ payload
            TaiKhoanAdmin taiKhoanAdmin = new TaiKhoanAdmin();
            taiKhoanAdmin.setTenDangNhap((String) payload.get("tenDangNhap"));
            taiKhoanAdmin.setEmail((String) payload.get("email"));
            taiKhoanAdmin.setHoVaTen((String) payload.get("hoVaTen"));
            taiKhoanAdmin.setMatKhauBam((String) payload.get("matKhauBam"));

            // Extract danh sách vai trò (nếu có)
            @SuppressWarnings("unchecked")
            List<Integer> vaiTroIds = (List<Integer>) payload.get("vaiTro");

            // Tạo tài khoản
            TaiKhoanAdmin created = taiKhoanAdminService.createTaiKhoan(taiKhoanAdmin);

            // Gán vai trò nếu có
            if (vaiTroIds != null && !vaiTroIds.isEmpty()) {
                taiKhoanAdminService.assignRolesToAccount(created.getMaTaiKhoan(), vaiTroIds);
            }

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Tạo tài khoản thành công", created));
        } catch (Exception e) {
            e.printStackTrace(); // Log lỗi để debug
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/update/{id}")
    @RequirePermission(feature = "USER", action = "UPDATE")
    public ResponseEntity<ApiResponse<TaiKhoanAdmin>> updateTaiKhoan(@PathVariable int id,
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

    @DeleteMapping("/{id}")
    @RequirePermission(feature = "USER", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteTaiKhoan(@PathVariable int id) {
        try {
            taiKhoanAdminService.deleteTaiKhoan(id);
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa tài khoản thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/search")
    @RequirePermission(feature = "USER", action = "VIEW")
    public ResponseEntity<ApiResponse<List<TaiKhoanAdmin>>> searchTaiKhoan(
            @RequestParam(required = false) String tenDangNhap,
            @RequestParam(required = false) String email) {
        List<TaiKhoanAdmin> results = taiKhoanAdminService.searchTaiKhoan(tenDangNhap, email);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    /**
     * Gán vai trò cho tài khoản admin
     * PUT /admin/dashboard/tkadmin/{id}/assign-roles
     * Body: { "vaiTroIds": [1, 2, 3] }
     */
    @PutMapping("/{id}/assign-roles")
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
     * Thêm một vai trò cho tài khoản admin
     * POST /admin/dashboard/tkadmin/{id}/roles/{roleId}
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
     * Xóa một vai trò khỏi tài khoản admin
     * DELETE /admin/dashboard/tkadmin/{id}/roles/{roleId}
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
}