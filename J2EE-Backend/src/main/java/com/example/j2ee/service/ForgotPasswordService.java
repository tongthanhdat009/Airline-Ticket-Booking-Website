package com.example.j2ee.service;

import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class ForgotPasswordService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int OTP_LENGTH = 6;
    private static final int OTP_TTL_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 5;
    private static final int RESEND_COOLDOWN_SECONDS = 60;

    // Store OTP in memory (trong production nên dùng Redis hoặc database
    // để hoạt động đúng khi chạy nhiều instance và không mất khi restart).
    private final Map<String, OTPData> otpStorage = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> lastSentAt = new ConcurrentHashMap<>();

    private static class OTPData {
        String otp;
        LocalDateTime expiry;
        int attempts;

        OTPData(String otp, LocalDateTime expiry) {
            this.otp = otp;
            this.expiry = expiry;
            this.attempts = 0;
        }
    }

    public void sendOTP(String email) {
        // Chống spam mail + dò quét: giới hạn tần suất gửi lại cho mỗi email.
        LocalDateTime lastSent = lastSentAt.get(email);
        if (lastSent != null) {
            long secondsLeft = RESEND_COOLDOWN_SECONDS
                    - java.time.Duration.between(lastSent, LocalDateTime.now()).getSeconds();
            if (secondsLeft > 0) {
                throw new IllegalArgumentException(
                        "Vui lòng đợi " + secondsLeft + " giây trước khi gửi lại mã");
            }
        }

        // Không tiết lộ email có tồn tại hay không (chống enumeration).
        // Email lạ → im lặng bỏ qua, controller vẫn trả thông báo chung.
        Optional<TaiKhoan> taiKhoanOpt = taiKhoanRepository.findByEmail(email);
        lastSentAt.put(email, LocalDateTime.now());
        if (taiKhoanOpt.isEmpty() || taiKhoanOpt.get().getHanhKhach() == null) {
            return;
        }

        // OTP 6 số bằng SecureRandom (không đoán được như java.util.Random).
        String otp = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));

        // Gửi OTP mới sẽ vô hiệu mã cũ và reset số lần thử.
        otpStorage.put(email, new OTPData(otp, LocalDateTime.now().plusMinutes(OTP_TTL_MINUTES)));

        // Gửi email OTP
        emailService.sendOTPEmail(email, otp);
    }

    public boolean verifyOTP(String email, String otp) {
        OTPData data = otpStorage.get(email);

        if (data == null) {
            throw new IllegalArgumentException("Mã OTP không chính xác hoặc đã hết hạn");
        }

        if (LocalDateTime.now().isAfter(data.expiry)) {
            otpStorage.remove(email);
            throw new IllegalArgumentException("Mã OTP đã hết hạn");
        }

        if (data.attempts >= MAX_ATTEMPTS) {
            otpStorage.remove(email);
            throw new IllegalArgumentException(
                    "Nhập sai quá nhiều lần, vui lòng gửi mã mới");
        }

        if (!data.otp.equals(otp)) {
            data.attempts++;
            if (data.attempts >= MAX_ATTEMPTS) {
                otpStorage.remove(email);
                throw new IllegalArgumentException(
                        "Nhập sai quá nhiều lần, vui lòng gửi mã mới");
            }
            throw new IllegalArgumentException("Mã OTP không chính xác");
        }

        // Đúng → reset số lần thử nhưng GIỮ mã để bước reset-password dùng tiếp.
        data.attempts = 0;
        return true;
    }

    public void resetPassword(String email, String otp, String newPassword) {
        // Verify OTP trước (bao gồm kiểm tra số lần thử và hạn dùng)
        verifyOTP(email, otp);

        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại"));

        taiKhoan.setMatKhauBam(passwordEncoder.encode(newPassword));
        taiKhoanRepository.save(taiKhoan);

        // Đốt OTP sau khi đặt lại mật khẩu thành công (không tái sử dụng)
        otpStorage.remove(email);

        // Gửi email xác nhận
        String userName = taiKhoan.getHanhKhach().getHoVaTen();
        emailService.sendPasswordResetSuccessEmail(email, userName);
    }
}
