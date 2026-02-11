package com.example.j2ee.controller;

import com.example.j2ee.service.DangNhapAdminService;
import com.example.j2ee.service.PermissionService;
import com.example.j2ee.service.RefreshTokenService;
import com.example.j2ee.jwt.JwtUtil;
import com.example.j2ee.security.AdminUserDetails;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/admin")
public class DangNhapAdminController {

    private final DangNhapAdminService dangNhapAdminService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final PermissionService permissionService;
    private final UserDetailsService adminDetailsService;

    // Cookie settings cho httpOnly refresh token
    private static final String REFRESH_COOKIE_NAME = "admin_refresh_token";
    private static final int REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 ngày (giây)

    public DangNhapAdminController(
            DangNhapAdminService dangNhapAdminService,
            JwtUtil jwtUtil,
            RefreshTokenService refreshTokenService,
            PermissionService permissionService,
            @Qualifier("adminAccountDetailsService") UserDetailsService adminDetailsService
    ) {
        this.dangNhapAdminService = dangNhapAdminService;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
        this.permissionService = permissionService;
        this.adminDetailsService = adminDetailsService;
    }

    @PostMapping("/dangnhap")
    public ResponseEntity<?> dangNhap(
            @RequestBody Map<String, String> payload,
            HttpServletResponse response
    ) {
        try {
            // Lấy username và password từ request
            String tenDangNhap = payload.get("tenDangNhap");
            String matKhau = payload.get("matKhau");

            // Xác thực (throw nếu sai)
            dangNhapAdminService.loginAdmin(tenDangNhap, matKhau);

            // Load user details để lấy roles và permissions
            AdminUserDetails adminUser = (AdminUserDetails) adminDetailsService.loadUserByUsername(tenDangNhap);

            // Lấy roles và permissions
            Set<String> roles = adminUser.getRoles();
            Set<String> permissions = adminUser.getPermissions();

            // === Sinh token với multi-role và permissions ===
            // Access token: typ=access, TTL ngắn, chứa cả roles và permissions
            String accessToken = jwtUtil.generateAccessToken(tenDangNhap, roles, permissions);

            // Refresh token: typ=refresh, TTL dài và lưu vào database ONLY
            var refreshTokenEntity = refreshTokenService.createRefreshTokenForAdmin(tenDangNhap);
            String refreshToken = refreshTokenEntity.getToken();

            // === SECURITY: Lưu refresh token vào httpOnly cookie ===
            // Sử dụng Set-Cookie header để có SameSite attribute
            String setCookieHeader = String.format(
                "%s=%s; Path=/; Max-Age=%d; HttpOnly; SameSite=Strict",
                REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_MAX_AGE
            );
            response.addHeader("Set-Cookie", setCookieHeader);

            // Trả về body: KHÔNG bao gồm refreshToken (chỉ accessToken + roles + permissions)
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("message", "Đăng nhập thành công");
            responseBody.put("accessToken", accessToken);
            // refreshToken KHÔNG được trả trong body - chỉ ở httpOnly cookie
            responseBody.put("roles", roles);
            responseBody.put("permissions", permissions);
            responseBody.put("username", tenDangNhap);

            return ResponseEntity.ok(responseBody);

        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi đăng nhập: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Endpoint refresh token - Đọc refresh token từ httpOnly cookie
    // Gọi: POST /admin/dangnhap/refresh (không cần body)
    @PostMapping("/dangnhap/refresh")
    public ResponseEntity<?> refreshAdmin(
            @CookieValue(value = REFRESH_COOKIE_NAME, required = false) String refreshToken
    ) {
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

        try {
            // Load user details để lấy roles và permissions mới nhất
            AdminUserDetails userDetails = (AdminUserDetails) adminDetailsService.loadUserByUsername(adminUser);

            // Sinh access token mới với roles và permissions
            Set<String> roles = userDetails.getRoles();
            Set<String> permissions = userDetails.getPermissions();
            String newAccessToken = jwtUtil.generateAccessToken(adminUser, roles, permissions);

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            response.put("roles", roles);
            response.put("permissions", permissions);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi khi tạo access token mới: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
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

            // Lấy thông tin từ token (multi-role support)
            String username = jwtUtil.getSubject(token);
            java.util.List<String> roles = jwtUtil.getRoles(token);
            java.util.List<String> permissions = jwtUtil.getPermissions(token);

            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("username", username);
            userInfo.put("roles", roles);
            userInfo.put("permissions", permissions);
            userInfo.put("isAuthenticated", true);

            return ResponseEntity.ok(userInfo);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi khi lấy thông tin user: " + e.getMessage());
            return ResponseEntity.status(401).body(errorResponse);
        }
    }

    // Endpoint logout - Thu hồi refresh token từ cookie và xóa cookie
    @PostMapping("/dangxuat")
    public ResponseEntity<?> logout(
            @CookieValue(value = REFRESH_COOKIE_NAME, required = false) String refreshToken,
            HttpServletResponse response
    ) {
        try {
            // Thu hồi refresh token từ cookie
            if (refreshToken != null && !refreshToken.isEmpty()) {
                refreshTokenService.revokeRefreshToken(refreshToken);
            }

            // Xóa cookie bằng Set-Cookie header với Max-Age=0
            String deleteCookieHeader = String.format(
                "%s=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict",
                REFRESH_COOKIE_NAME
            );
            response.addHeader("Set-Cookie", deleteCookieHeader);

            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("message", "Đăng xuất thành công");
            return ResponseEntity.ok(responseBody);
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
