package com.example.j2ee.service;

import com.example.j2ee.model.HanhKhach;
import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.repository.TaiKhoanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ForgotPasswordServiceTest {

    @Mock
    private TaiKhoanRepository taiKhoanRepository;
    @Mock
    private EmailService emailService;
    @Mock
    private PasswordEncoder passwordEncoder;

    private ForgotPasswordService service;
    private TaiKhoan taiKhoan;

    @BeforeEach
    void setUp() {
        service = new ForgotPasswordService(taiKhoanRepository, emailService, passwordEncoder);
        HanhKhach hk = new HanhKhach();
        hk.setHoVaTen("Nguyen Van Test");
        taiKhoan = new TaiKhoan();
        taiKhoan.setEmail("test@example.com");
        taiKhoan.setHanhKhach(hk);
    }

    @Test
    void sendOTP_unknownEmail_isSilent() {
        when(taiKhoanRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> service.sendOTP("ghost@example.com"));
        verify(emailService, never()).sendOTPEmail(anyString(), anyString());
    }

    @Test
    void sendOTP_twiceWithinCooldown_blocked() {
        when(taiKhoanRepository.findByEmail("test@example.com")).thenReturn(Optional.of(taiKhoan));

        service.sendOTP("test@example.com");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.sendOTP("test@example.com"));
        assertTrue(ex.getMessage().contains("Vui lòng đợi"));
        verify(emailService, times(1)).sendOTPEmail(eq("test@example.com"), anyString());
    }

    @Test
    void verifyOTP_fiveWrongAttempts_locksOut() {
        when(taiKhoanRepository.findByEmail("test@example.com")).thenReturn(Optional.of(taiKhoan));
        service.sendOTP("test@example.com");

        for (int i = 0; i < 4; i++) {
            assertThrows(IllegalArgumentException.class, () -> service.verifyOTP("test@example.com", "000000"));
        }
        IllegalArgumentException locked = assertThrows(IllegalArgumentException.class,
                () -> service.verifyOTP("test@example.com", "000000"));
        assertTrue(locked.getMessage().contains("quá nhiều"));

        // Kể cả mã đúng cũng không còn dùng được sau khi bị khóa
        assertThrows(IllegalArgumentException.class, () -> service.verifyOTP("test@example.com", "000000"));
    }

    @Test
    void resetPassword_consumesOTP() {
        when(passwordEncoder.encode("NewPass1!")).thenReturn("hashed");

        String otp = sendAndCaptureOtp();
        assertTrue(otp.matches("\\d{6}"), "OTP phải là 6 chữ số, nhận được: " + otp);
        assertTrue(service.verifyOTP("test@example.com", otp));

        service.resetPassword("test@example.com", otp, "NewPass1!");
        verify(taiKhoanRepository).save(taiKhoan);

        // OTP đã bị đốt: xác thực lại phải thất bại
        assertThrows(IllegalArgumentException.class, () -> service.verifyOTP("test@example.com", otp));
    }

    private String sendAndCaptureOtp() {
        when(taiKhoanRepository.findByEmail("test@example.com")).thenReturn(Optional.of(taiKhoan));
        service.sendOTP("test@example.com");
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendOTPEmail(eq("test@example.com"), captor.capture());
        return captor.getValue();
    }

    @Test
    void verifyOTP_wrongThenCorrect_resetsAttempts() {
        when(taiKhoanRepository.findByEmail("test@example.com")).thenReturn(Optional.of(taiKhoan));
        String otp = sendAndCaptureOtp();

        assertThrows(IllegalArgumentException.class, () -> service.verifyOTP("test@example.com", "000000"));
        assertTrue(service.verifyOTP("test@example.com", otp));
    }
}
