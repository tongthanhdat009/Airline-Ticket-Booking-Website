package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.auth.ForgotPasswordRequest;
import com.example.j2ee.dto.auth.ResetPasswordRequest;
import com.example.j2ee.dto.auth.SendVerificationRequest;
import com.example.j2ee.dto.auth.VerifyOtpRequest;
import com.example.j2ee.service.EmailVerificationService;
import com.example.j2ee.service.ForgotPasswordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
public class AuthController {

    private final EmailVerificationService emailVerificationService;
    private final ForgotPasswordService forgotPasswordService;

    @PostMapping("/send-verification")
    public ResponseEntity<ApiResponse<Void>> sendVerificationEmail(
            @Valid @RequestBody SendVerificationRequest request) {
        try {
            emailVerificationService.sendVerificationEmail(request.getEmail());
            return ResponseEntity.ok(
                ApiResponse.successMessage("Email xác thực đã được gửi thành công")
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi gửi email xác thực: " + e.getMessage()));
        }
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String token) {
        try {
            System.out.println("=== Verifying email with token: " + token);
            emailVerificationService.verifyEmail(token);
            return ResponseEntity.ok(
                ApiResponse.successMessage("Xác thực email thành công")
            );
        } catch (IllegalArgumentException e) {
            System.err.println("=== Verification failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            System.err.println("=== Verification error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi xác thực email: " + e.getMessage()));
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerificationEmail(
            @Valid @RequestBody SendVerificationRequest request) {
        try {
            emailVerificationService.resendVerificationEmail(request.getEmail());
            return ResponseEntity.ok(
                ApiResponse.successMessage("Email xác thực đã được gửi lại thành công")
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi gửi lại email xác thực: " + e.getMessage()));
        }
    }

    // Forgot Password endpoints
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> sendForgotPasswordOTP(
            @Valid @RequestBody ForgotPasswordRequest request) {
        try {
            forgotPasswordService.sendOTP(request.getEmail());
            return ResponseEntity.ok(
                ApiResponse.successMessage("Mã OTP đã được gửi đến email của bạn")
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi gửi OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOTP(
            @Valid @RequestBody VerifyOtpRequest request) {
        try {
            forgotPasswordService.verifyOTP(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(
                ApiResponse.successMessage("Xác thực OTP thành công")
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi xác thực OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        try {
            forgotPasswordService.resetPassword(
                request.getEmail(), 
                request.getOtp(), 
                request.getNewPassword()
            );
            return ResponseEntity.ok(
                ApiResponse.successMessage("Đặt lại mật khẩu thành công")
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi đặt lại mật khẩu: " + e.getMessage()));
        }
    }
}
