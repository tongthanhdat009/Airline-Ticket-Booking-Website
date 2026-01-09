package com.example.j2ee.controller;


import com.example.j2ee.service.DangKyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
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
}
