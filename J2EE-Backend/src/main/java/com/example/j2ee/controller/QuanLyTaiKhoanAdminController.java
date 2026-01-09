package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.TaiKhoanAdmin;
import com.example.j2ee.service.TaiKhoanAdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/dashboard/tkadmin")
public class QuanLyTaiKhoanAdminController {
    private final TaiKhoanAdminService taiKhoanAdminService;

    public QuanLyTaiKhoanAdminController(TaiKhoanAdminService taiKhoanAdminService) {
        this.taiKhoanAdminService = taiKhoanAdminService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaiKhoanAdmin>>> getAllTaiKhoan() {
        List<TaiKhoanAdmin> taiKhoanAdminList = taiKhoanAdminService.getAllTaiKhoan();
        return ResponseEntity.ok(ApiResponse.success(taiKhoanAdminList));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaiKhoanAdmin>> getTaiKhoanById(@PathVariable int id) {
        return taiKhoanAdminService.getTaiKhoanById(id)
                .map(taiKhoan -> ResponseEntity.ok(ApiResponse.success(taiKhoan)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy tài khoản")));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaiKhoanAdmin>> createTaiKhoan(@RequestBody TaiKhoanAdmin taiKhoanAdmin) {
        try {
            TaiKhoanAdmin created = taiKhoanAdminService.createTaiKhoan(taiKhoanAdmin);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Tạo tài khoản thành công", created));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<TaiKhoanAdmin>> updateTaiKhoan(@PathVariable int id, @RequestBody TaiKhoanAdmin taiKhoanAdmin) {
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
    public ResponseEntity<ApiResponse<List<TaiKhoanAdmin>>> searchTaiKhoan(
            @RequestParam(required = false) String tenDangNhap,
            @RequestParam(required = false) String email) {
        List<TaiKhoanAdmin> results = taiKhoanAdminService.searchTaiKhoan(tenDangNhap, email);
        return ResponseEntity.ok(ApiResponse.success(results));
    }
}