package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.auth.LoginRequest;
import com.example.j2ee.dto.auth.LoginResponse;
import com.example.j2ee.dto.auth.RefreshTokenRequest;
import com.example.j2ee.dto.auth.RefreshTokenResponse;
import com.example.j2ee.dto.auth.UserInfoResponse;
import com.example.j2ee.service.DangNhapService;
import com.example.j2ee.service.RefreshTokenService;
import com.example.j2ee.jwt.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class DangNhapController {

    private final DangNhapService dangNhapService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/dangnhap")
    public ResponseEntity<ApiResponse<LoginResponse>> dangNhap(
            @Valid @RequestBody LoginRequest request) {
        try {
            dangNhapService.login(request.getEmail(), request.getMatKhau());

            // Tạo access token với role CUSTOMER cho khách hàng
            String accessToken = jwtUtil.generateAccessToken(request.getEmail(), "CUSTOMER");

            // Tạo và lưu refresh token vào database
            var refreshTokenEntity = refreshTokenService.createRefreshTokenForCustomer(request.getEmail());
            String refreshToken = refreshTokenEntity.getToken();

            LoginResponse response = new LoginResponse(
                "Đăng nhập thành công",
                accessToken,
                refreshToken
            );

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi đăng nhập: " + e.getMessage()));
        }
    }

    @PostMapping("/dangnhap/refresh")
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {
        try {
            String refresh = request.getRefreshToken();

            // Kiểm tra JWT format và signature
            if (!jwtUtil.isRefreshToken(refresh)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Refresh token không hợp lệ"));
            }

            // Validate với database
            if (!refreshTokenService.validateRefreshToken(refresh)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Refresh token không hợp lệ hoặc đã hết hạn"));
            }

            String email = jwtUtil.getSubject(refresh);
            // Tạo access token mới với role CUSTOMER
            String newAccess = jwtUtil.generateAccessToken(email, "CUSTOMER");

            RefreshTokenResponse response = new RefreshTokenResponse(newAccess);
            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (io.jsonwebtoken.ExpiredJwtException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Refresh token đã hết hạn"));
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Refresh token không hợp lệ"));
        }
    }

    // Endpoint lấy thông tin khách hàng hiện tại từ token
    @GetMapping("/current-user")
    public ResponseEntity<ApiResponse<UserInfoResponse>> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Thiếu hoặc sai định dạng token"));
            }

            String token = authHeader.substring(7);
            
            // Kiểm tra token hợp lệ
            if (!jwtUtil.validate(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Token không hợp lệ hoặc đã hết hạn"));
            }

            // Lấy thông tin từ token
            String email = jwtUtil.getSubject(token);
            String role = jwtUtil.getRole(token);
            
            // Nếu không có role trong token, mặc định là CUSTOMER
            if (role == null || role.isEmpty()) {
                role = "CUSTOMER";
            }

            UserInfoResponse userInfo = new UserInfoResponse(email, role, true);
            return ResponseEntity.ok(ApiResponse.success(userInfo));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Lỗi khi lấy thông tin user: " + e.getMessage()));
        }
    }

    // Endpoint logout - thu hồi refresh token
    @PostMapping("/dangxuat")
    public ResponseEntity<ApiResponse<String>> logout(
            @RequestBody Map<String, String> payload) {
        try {
            String refreshToken = payload.get("refreshToken");

            if (refreshToken != null && !refreshToken.isEmpty()) {
                refreshTokenService.revokeRefreshToken(refreshToken);
            }

            return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi đăng xuất: " + e.getMessage()));
        }
    }

    // Endpoint logout tất cả devices - thu hồi tất cả refresh tokens
    @PostMapping("/dangxuat/all")
    public ResponseEntity<ApiResponse<String>> logoutAll(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Thiếu hoặc sai định dạng token"));
            }

            String token = authHeader.substring(7);

            if (!jwtUtil.validate(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Token không hợp lệ hoặc đã hết hạn"));
            }

            String email = jwtUtil.getSubject(token);

            // Thu hồi tất cả refresh tokens của user này
            refreshTokenService.revokeAllRefreshTokensForCustomer(email);

            return ResponseEntity.ok(ApiResponse.success("Đăng xuất tất cả thiết bị thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi đăng xuất: " + e.getMessage()));
        }
    }
}