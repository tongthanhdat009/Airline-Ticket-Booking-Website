package com.example.j2ee.controller;

import com.example.j2ee.service.DangNhapAdminService;
import com.example.j2ee.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class DangNhapAdminController {

    private final DangNhapAdminService dangNhapAdminService;
    private final JwtUtil jwtUtil;

    @PostMapping("/dangnhap")
    public ResponseEntity<?> dangNhap(@RequestBody Map<String, String> payload,
                                      HttpServletResponse res) {
        try {
            // Lấy email và password từ request
            String tenDangNhap = payload.get("tenDangNhap");
            String matKhau = payload.get("matKhau");

            // Xác thực (throw nếu sai)
            dangNhapAdminService.loginAdmin(tenDangNhap, matKhau);

            // === Sinh token ===
            // Access token: typ=access, TTL ngắn
            String accessToken = jwtUtil.generateAccessToken(tenDangNhap, "ADMIN");

            // Refresh token: typ=refresh, TTL dài
            String refreshToken = jwtUtil.generateRefreshToken(tenDangNhap);

            // (Khuyến nghị) Đặt refresh vào HttpOnly cookie để chống XSS
            ResponseCookie cookie = ResponseCookie.from("refresh_token_admin", refreshToken)
                    .httpOnly(true)
                    .secure(false)                 // DEV: false cho http://localhost; PROD nhớ đổi true
                    .sameSite("Strict")
                    .path("/admin/dangnhap/refresh") // cookie chỉ gửi tới endpoint refresh admin
                    .maxAge(Duration.ofDays(30))
                    .build();
            res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            // Trả về body: accessToken + (kèm refreshToken để bạn dễ test Postman)
            Map<String, String> response = new HashMap<>();
            response.put("message", "Đăng nhập thành công");
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // (Bonus) Endpoint xin access token mới cho ADMIN bằng refresh cookie
    // Gọi: POST /admin/dangnhap/refresh (không cần Authorization)
    @PostMapping("/dangnhap/refresh")
    public ResponseEntity<?> refreshAdmin(
            @CookieValue(value = "refresh_token_admin", required = false) String rt
    ) {
        if (rt == null || !jwtUtil.isRefreshToken(rt)) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Thiếu/ sai refresh token");
            return ResponseEntity.status(401).body(errorResponse);
        }
        String adminUser = jwtUtil.getSubject(rt);
        String newAccess = jwtUtil.generateAccessToken(adminUser, "ADMIN");
        
        Map<String, String> response = new HashMap<>();
        response.put("accessToken", newAccess);
        return ResponseEntity.ok(response);
    }

    // Endpoint lấy thông tin user hiện tại từ token
    @GetMapping("/current-user")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Thiếu hoặc sai định dạng token");
                return ResponseEntity.status(401).body(errorResponse);
            }

            String token = authHeader.substring(7);
            
            // Kiểm tra token hợp lệ
            if (!jwtUtil.validate(token)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Token không hợp lệ hoặc đã hết hạn");
                return ResponseEntity.status(401).body(errorResponse);
            }

            // Lấy thông tin từ token
            String username = jwtUtil.getSubject(token);
            String role = jwtUtil.getRole(token);
            
            // Nếu không có role trong token, mặc định là ADMIN
            if (role == null || role.isEmpty()) {
                role = "ADMIN";
            }

            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("username", username);
            userInfo.put("role", role);
            userInfo.put("isAuthenticated", true);

            return ResponseEntity.ok(userInfo);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi khi lấy thông tin user: " + e.getMessage());
            return ResponseEntity.status(401).body(errorResponse);
        }
    }
}
