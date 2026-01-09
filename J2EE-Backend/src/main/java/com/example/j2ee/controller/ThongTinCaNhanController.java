package com.example.j2ee.controller;

import com.example.j2ee.dto.UpdateThongTinCaNhanRequest;
import com.example.j2ee.service.ThongTinCaNhanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping()
@RequiredArgsConstructor
public class ThongTinCaNhanController {

    private final ThongTinCaNhanService thongTinCaNhanService;

    /**
     * API: GET /thong-tin-ca-nhan
     *
     * Lấy thông tin cá nhân của khách hàng đang đăng nhập.
     *
     * @param user UserDetails của người dùng đang đăng nhập
     * @return 200 OK + thông tin cá nhân; 401 nếu không đăng nhập
     */
    @GetMapping("/thong-tin-ca-nhan")
    public ResponseEntity<Map<String, Object>> getProfile(
            @AuthenticationPrincipal UserDetails user) {

        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        String email = user.getUsername();
        Map<String, Object> body = thongTinCaNhanService.myProfile(email);
        return ResponseEntity.ok(body);
    }

    /**
     * API: PUT /thong-tin-ca-nhan
     *
     * Cập nhật thông tin cá nhân của khách hàng đang đăng nhập.
     * 
     * Lưu ý:
     *  - Client không nhất thiết phải gửi tất cả field, có thể gửi một phần
     *  - Những field không gửi sẽ giữ nguyên giá trị cũ
     *  - Email không thể update (được xác định từ JWT token)
     *
     * @param user UserDetails của người dùng đang đăng nhập
     * @param request DTO chứa dữ liệu muốn update
     * @return 200 OK + thông tin đã update; 401 nếu không đăng nhập
     */
    @PutMapping("/thong-tin-ca-nhan/chinh-sua")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody UpdateThongTinCaNhanRequest request) {

        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        String email = user.getUsername();
        Map<String, Object> updated = thongTinCaNhanService.updateProfile(email, request);
        return ResponseEntity.ok(updated);
    }
}

