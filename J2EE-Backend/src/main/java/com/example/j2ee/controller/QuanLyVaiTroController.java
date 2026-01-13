package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.VaiTro;
import com.example.j2ee.service.VaiTroService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/dashboard/vai-tro")
public class QuanLyVaiTroController {

    private final VaiTroService vaiTroService;

    public QuanLyVaiTroController(VaiTroService vaiTroService) {
        this.vaiTroService = vaiTroService;
    }

    /**
     * Lấy tất cả vai trò
     * GET /admin/dashboard/vai-tro
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<VaiTro>>> getAllVaiTro() {
        List<VaiTro> vaiTroList = vaiTroService.getAllVaiTro();
        return ResponseEntity.ok(ApiResponse.success(vaiTroList));
    }

    /**
     * Lấy vai trò theo ID
     * GET /admin/dashboard/vai-tro/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VaiTro>> getVaiTroById(@PathVariable int id) {
        return vaiTroService.getVaiTroById(id)
                .map(vaiTro -> ResponseEntity.ok(ApiResponse.success(vaiTro)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy vai trò")));
    }

    /**
     * Tạo vai trò mới
     * POST /admin/dashboard/vai-tro
     * Validation: Tên vai trò không được để trống, trạng thái mặc định là Active
     */
    @PostMapping
    public ResponseEntity<ApiResponse<VaiTro>> createVaiTro(@RequestBody VaiTro vaiTro) {
        try {
            VaiTro created = vaiTroService.createVaiTro(vaiTro);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Tạo vai trò thành công", created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * Cập nhật vai trò
     * PUT /admin/dashboard/vai-tro/update/{id}
     * Validation: Tên vai trò không được để trống
     */
    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<VaiTro>> updateVaiTro(
            @PathVariable int id,
            @RequestBody VaiTro vaiTro) {
        try {
            VaiTro updated = vaiTroService.updateVaiTro(id, vaiTro);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật vai trò thành công", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * Xóa vai trò (soft delete)
     * DELETE /admin/dashboard/vai-tro/{id}
     * Validation: Không được xóa khi có tài khoản đang sử dụng
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVaiTro(@PathVariable int id) {
        try {
            vaiTroService.deleteVaiTro(id);
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa vai trò thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * Lấy danh sách vai trò theo trạng thái
     * GET /admin/dashboard/vai-tro/trang-thai?trangThai=true
     */
    @GetMapping("/trang-thai")
    public ResponseEntity<ApiResponse<List<VaiTro>>> getVaiTroByTrangThai(
            @RequestParam Boolean trangThai) {
        List<VaiTro> vaiTroList = vaiTroService.getVaiTroByTrangThai(trangThai);
        return ResponseEntity.ok(ApiResponse.success(vaiTroList));
    }

    /**
     * Tìm kiếm vai trò
     * GET /admin/dashboard/vai-tro/search?keyword=admin
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<VaiTro>>> searchVaiTro(
            @RequestParam String keyword) {
        List<VaiTro> vaiTroList = vaiTroService.searchVaiTro(keyword);
        return ResponseEntity.ok(ApiResponse.success(vaiTroList));
    }

    /**
     * Đếm số admin đang sử dụng vai trò
     * GET /admin/dashboard/vai-tro/{id}/count-admin
     */
    @GetMapping("/{id}/count-admin")
    public ResponseEntity<ApiResponse<Long>> countAdminByVaiTro(@PathVariable int id) {
        long count = vaiTroService.countAdminByVaiTro(id);
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
