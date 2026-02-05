package com.example.j2ee.controller;

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
 * Controller quản lý phân quyền theo vai trò (RBAC)
 * 
 * LƯU Ý: Không cho phép chỉnh sửa phân quyền của vai trò SUPER_ADMIN
 */
@RestController
@RequestMapping("/admin/dashboard/phan-quyen")
@RequiredArgsConstructor
@Slf4j
public class QuanLyPhanQuyenController {

    private final PhanQuyenService phanQuyenService;

    /**
     * Lấy tất cả chức năng trong hệ thống
     * GET /admin/dashboard/phan-quyen/chuc-nang
     */
    @GetMapping("/chuc-nang")
    @RequirePermission(feature = "PERMISSION", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ChucNangDTO>>> getAllChucNang() {
        List<ChucNangDTO> chucNangList = phanQuyenService.getAllChucNang();
        return ResponseEntity.ok(ApiResponse.success(chucNangList));
    }

    /**
     * Lấy tất cả chức năng theo nhóm
     * GET /admin/dashboard/phan-quyen/chuc-nang/grouped
     */
    @GetMapping("/chuc-nang/grouped")
    @RequirePermission(feature = "PERMISSION", action = "VIEW")
    public ResponseEntity<ApiResponse<Map<String, List<ChucNangDTO>>>> getAllChucNangGrouped() {
        Map<String, List<ChucNangDTO>> grouped = phanQuyenService.getAllChucNangGrouped();
        return ResponseEntity.ok(ApiResponse.success(grouped));
    }

    /**
     * Lấy tất cả hành động trong hệ thống
     * GET /admin/dashboard/phan-quyen/hanh-dong
     */
    @GetMapping("/hanh-dong")
    @RequirePermission(feature = "PERMISSION", action = "VIEW")
    public ResponseEntity<ApiResponse<List<HanhDongDTO>>> getAllHanhDong() {
        List<HanhDongDTO> hanhDongList = phanQuyenService.getAllHanhDong();
        return ResponseEntity.ok(ApiResponse.success(hanhDongList));
    }

    /**
     * Lấy tất cả vai trò kèm thông tin SUPER_ADMIN
     * GET /admin/dashboard/phan-quyen/vai-tro
     */
    @GetMapping("/vai-tro")
    @RequirePermission(feature = "PERMISSION", action = "VIEW")
    public ResponseEntity<ApiResponse<List<PhanQuyenResponse.VaiTroInfo>>> getAllVaiTro() {
        List<PhanQuyenResponse.VaiTroInfo> vaiTroList = phanQuyenService.getAllVaiTroWithSuperAdminFlag();
        return ResponseEntity.ok(ApiResponse.success(vaiTroList));
    }

    /**
     * Lấy danh sách phân quyền của một vai trò
     * GET /admin/dashboard/phan-quyen/vai-tro/{maVaiTro}
     */
    @GetMapping("/vai-tro/{maVaiTro}")
    @RequirePermission(feature = "PERMISSION", action = "VIEW")
    public ResponseEntity<ApiResponse<PhanQuyenResponse>> getPhanQuyenByVaiTro(@PathVariable int maVaiTro) {
        try {
            PhanQuyenResponse response = phanQuyenService.getPhanQuyenByVaiTro(maVaiTro);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Lấy ma trận phân quyền của một vai trò
     * GET /admin/dashboard/phan-quyen/vai-tro/{maVaiTro}/matrix
     * 
     * Trả về map có key là "maChucNang-maHanhDong", value là true/false
     */
    @GetMapping("/vai-tro/{maVaiTro}/matrix")
    @RequirePermission(feature = "PERMISSION", action = "VIEW")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> getPermissionMatrix(@PathVariable int maVaiTro) {
        try {
            Map<String, Boolean> matrix = phanQuyenService.getPermissionMatrix(maVaiTro);
            return ResponseEntity.ok(ApiResponse.success(matrix));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Cập nhật phân quyền cho vai trò
     * PUT /admin/dashboard/phan-quyen/vai-tro
     * 
     * Request body:
     * {
     * "maVaiTro": 2,
     * "permissions": [
     * { "maChucNang": 1, "maHanhDong": "VIEW" },
     * { "maChucNang": 1, "maHanhDong": "CREATE" }
     * ]
     * }
     * 
     * LƯU Ý: Không cho phép chỉnh sửa phân quyền của vai trò SUPER_ADMIN
     */
    @PutMapping("/vai-tro")
    @RequirePermission(feature = "PERMISSION", action = "UPDATE")
    public ResponseEntity<ApiResponse<PhanQuyenResponse>> updatePhanQuyen(@RequestBody PhanQuyenRequest request) {
        try {
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
     * Thêm một quyền cho vai trò
     * POST /admin/dashboard/phan-quyen/vai-tro/{maVaiTro}/permission
     * 
     * Request params:
     * - maChucNang: ID chức năng
     * - maHanhDong: Mã hành động (VIEW, CREATE, UPDATE, DELETE, ...)
     * 
     * LƯU Ý: Không cho phép chỉnh sửa phân quyền của vai trò SUPER_ADMIN
     */
    @PostMapping("/vai-tro/{maVaiTro}/permission")
    @RequirePermission(feature = "PERMISSION", action = "UPDATE")
    public ResponseEntity<ApiResponse<PhanQuyen>> addPermission(
            @PathVariable int maVaiTro,
            @RequestParam int maChucNang,
            @RequestParam String maHanhDong) {
        try {
            PhanQuyen pq = phanQuyenService.addPermission(maVaiTro, maChucNang, maHanhDong);
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
     * Xóa một quyền khỏi vai trò
     * DELETE /admin/dashboard/phan-quyen/vai-tro/{maVaiTro}/permission
     * 
     * Request params:
     * - maChucNang: ID chức năng
     * - maHanhDong: Mã hành động
     * 
     * LƯU Ý: Không cho phép chỉnh sửa phân quyền của vai trò SUPER_ADMIN
     */
    @DeleteMapping("/vai-tro/{maVaiTro}/permission")
    @RequirePermission(feature = "PERMISSION", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> removePermission(
            @PathVariable int maVaiTro,
            @RequestParam int maChucNang,
            @RequestParam String maHanhDong) {
        try {
            phanQuyenService.removePermission(maVaiTro, maChucNang, maHanhDong);
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
     * Sao chép phân quyền từ vai trò này sang vai trò khác
     * POST /admin/dashboard/phan-quyen/copy
     * 
     * Request params:
     * - fromVaiTro: ID vai trò nguồn
     * - toVaiTro: ID vai trò đích
     * 
     * LƯU Ý: Không cho phép sao chép sang vai trò SUPER_ADMIN
     */
    @PostMapping("/copy")
    @RequirePermission(feature = "PERMISSION", action = "UPDATE")
    public ResponseEntity<ApiResponse<PhanQuyenResponse>> copyPermissions(
            @RequestParam int fromVaiTro,
            @RequestParam int toVaiTro) {
        try {
            PhanQuyenResponse response = phanQuyenService.copyPermissions(fromVaiTro, toVaiTro);
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
}
