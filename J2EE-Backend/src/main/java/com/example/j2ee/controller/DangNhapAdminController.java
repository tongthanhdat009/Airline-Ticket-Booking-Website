package com.example.j2ee.controller;

import com.example.j2ee.service.DangNhapAdminService;
import com.example.j2ee.service.RefreshTokenService;
import com.example.j2ee.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class DangNhapAdminController {

    private final DangNhapAdminService dangNhapAdminService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/dangnhap")
    public ResponseEntity<?> dangNhap(@RequestBody Map<String, String> payload) {
        try {
            // Lấy username và password từ request
            String tenDangNhap = payload.get("tenDangNhap");
            String matKhau = payload.get("matKhau");

            // Xác thực (throw nếu sai)
            dangNhapAdminService.loginAdmin(tenDangNhap, matKhau);

            // === Sinh token ===
            // Access token: typ=access, TTL ngắn
            String accessToken = jwtUtil.generateAccessToken(tenDangNhap, "ADMIN");

            // Refresh token: typ=refresh, TTL dài và lưu vào database ONLY
            var refreshTokenEntity = refreshTokenService.createRefreshTokenForAdmin(tenDangNhap);
            String refreshToken = refreshTokenEntity.getToken();

            // Trả về body: accessToken + refreshToken
            // Refresh token chỉ được lưu trong database, không gửi qua cookie
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

    // Endpoint refresh token - nhận refresh token từ request body
    // Gọi: POST /admin/dangnhap/refresh với body { "refreshToken": "..." }
    @PostMapping("/dangnhap/refresh")
    public ResponseEntity<?> refreshAdmin(@RequestBody Map<String, String> payload) {
        String refreshToken = payload.get("refreshToken");
        
        if (refreshToken == null || refreshToken.isEmpty() || !jwtUtil.isRefreshToken(refreshToken)) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Thiếu hoặc sai refresh token");
            return ResponseEntity.status(401).body(errorResponse);
        }

        // Validate với database
        if (!refreshTokenService.validateRefreshToken(refreshToken)) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Refresh token không hợp lệ hoặc đã hết hạn");
            return ResponseEntity.status(401).body(errorResponse);
        }

        String adminUser = jwtUtil.getSubject(refreshToken);
        String newAccessToken = jwtUtil.generateAccessToken(adminUser, "ADMIN");

        Map<String, String> response = new HashMap<>();
        response.put("accessToken", newAccessToken);
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

    // Endpoint logout - thu hồi refresh token từ request body
    @PostMapping("/dangxuat")
    public ResponseEntity<?> logout(@RequestBody(required = false) Map<String, String> payload) {
        try {
            // Thu hồi refresh token từ request body
            if (payload != null && payload.containsKey("refreshToken")) {
                String refreshToken = payload.get("refreshToken");
                if (refreshToken != null && !refreshToken.isEmpty()) {
                    refreshTokenService.revokeRefreshToken(refreshToken);
                }
            }

            Map<String, String> response = new HashMap<>();
            response.put("message", "Đăng xuất thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi khi đăng xuất: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Endpoint logout tất cả devices - thu hồi tất cả refresh tokens
    @PostMapping("/dangxuat/all")
    public ResponseEntity<?> logoutAll(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Thiếu hoặc sai định dạng token");
                return ResponseEntity.status(401).body(errorResponse);
            }

            String token = authHeader.substring(7);

            if (!jwtUtil.validate(token)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Token không hợp lệ hoặc đã hết hạn");
                return ResponseEntity.status(401).body(errorResponse);
            }

            String username = jwtUtil.getSubject(token);

            // Thu hồi tất cả refresh tokens của admin này
            refreshTokenService.revokeAllRefreshTokensForAdmin(username);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Đăng xuất tất cả thiết bị thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi khi đăng xuất: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
