package com.example.j2ee.service;

import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ForgotPasswordService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    // Store OTP in memory (in production, use Redis or database)
    private final Map<String, OTPData> otpStorage = new HashMap<>();

    private static class OTPData {
        String otp;
        LocalDateTime expiry;
        
        OTPData(String otp, LocalDateTime expiry) {
            this.otp = otp;
            this.expiry = expiry;
        }
    }

    public void sendOTP(String email) {
        // Check if email exists
        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại trong hệ thống"));

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        // Store OTP with 5 minutes expiry
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);
        otpStorage.put(email, new OTPData(otp, expiry));
        
        // Send OTP via email
        emailService.sendOTPEmail(email, otp);
    }

    public boolean verifyOTP(String email, String otp) {
        OTPData data = otpStorage.get(email);
        
        if (data == null) {
            throw new IllegalArgumentException("Không tìm thấy mã OTP cho email này");
        }
        
        if (LocalDateTime.now().isAfter(data.expiry)) {
            otpStorage.remove(email);
            throw new IllegalArgumentException("Mã OTP đã hết hạn");
        }
        
        if (!data.otp.equals(otp)) {
            throw new IllegalArgumentException("Mã OTP không chính xác");
        }
        
        return true;
    }

    public void resetPassword(String email, String otp, String newPassword) {
        // Verify OTP first
        verifyOTP(email, otp);
        
        // Find user and update password
        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại"));
        
        taiKhoan.setMatKhauBam(passwordEncoder.encode(newPassword));
        taiKhoanRepository.save(taiKhoan);
        
        // Remove OTP after successful password reset
        otpStorage.remove(email);
        
        // Send confirmation email
        String userName = taiKhoan.getHanhKhach().getHoVaTen();
        emailService.sendPasswordResetSuccessEmail(email, userName);
    }
}
