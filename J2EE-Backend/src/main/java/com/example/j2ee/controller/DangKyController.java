package com.example.j2ee.controller;


import com.example.j2ee.service.DangKyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class DangKyController {
    private final DangKyService dangKyService;

    @PostMapping("/dangky")
    public ResponseEntity<?> dangKy(@RequestBody Map<String, String> payload) {
        String hoVaTen = payload.get("hoVaTen");
        String email = payload.get("email");
        String soDienThoai = payload.get("soDienThoai");
        String ngaySinh = payload.get("ngaySinh");
        String matKhau = payload.get("matKhau");

        try {
            dangKyService.dangKy(hoVaTen, email, soDienThoai, ngaySinh, matKhau);
            return ResponseEntity.ok(Collections.singletonMap("message", "Đăng ký thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    /**
     * Kiểm tra email đã tồn tại chưa
     */
    @PostMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Email không được để trống"));
        }

        boolean exists = dangKyService.checkEmailExists(email);
        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    /**
     * Kiểm tra số điện thoại đã tồn tại chưa
     */
    @PostMapping("/check-phone")
    public ResponseEntity<?> checkPhone(@RequestBody Map<String, String> payload) {
        String soDienThoai = payload.get("soDienThoai");

        if (soDienThoai == null || soDienThoai.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Số điện thoại không được để trống"));
        }

        boolean exists = dangKyService.checkPhoneExists(soDienThoai);
        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }
}
