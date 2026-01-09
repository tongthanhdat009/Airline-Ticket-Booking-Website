package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.service.TaiKhoanService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/dashboard/tkkhachhang")
public class QuanLyTaiKhoanController {
    private final TaiKhoanService taiKhoanService;
    public QuanLyTaiKhoanController(TaiKhoanService taiKhoanService) {
        this.taiKhoanService = taiKhoanService;
    }

    // Lấy danh sách tài khoản
    @GetMapping
    public ResponseEntity<ApiResponse<List<TaiKhoan>>> getAll() {
        List<TaiKhoan> list = taiKhoanService.getAllTaiKhoan();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tài khoản thành công", list));
    }

    // Lấy chi tiết tài khoản theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaiKhoan>> getById(@PathVariable int id) {
        TaiKhoan tk = taiKhoanService.getTaiKhoanById(id);
        if (tk == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy tài khoản với id: " + id));
        }
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin tài khoản thành công", tk));
    }

    // Cập nhật tài khoản
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaiKhoan>> update(@PathVariable int id, @RequestBody TaiKhoan updated) {
        TaiKhoan saved = taiKhoanService.updateTaiKhoan(id, updated);
        if (saved == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy tài khoản với id: " + id));
        }
        return ResponseEntity.ok(ApiResponse.success("Cập nhật tài khoản thành công", saved));
    }

    // Xoá tài khoản
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable int id) {
        boolean ok = taiKhoanService.deleteTaiKhoan(id);
        if (!ok) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy tài khoản với id: " + id));
        }
        return ResponseEntity.ok(ApiResponse.successMessage("Xoá tài khoản thành công"));
    }

    // Xử lý lỗi validate từ service (ví dụ: email/mật khẩu không hợp lệ, email trùng, ...)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
    }
}
