package com.example.j2ee.service;

import com.example.j2ee.jwt.JwtUtil;
import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DangNhapService {

    private final TaiKhoanRepository taikhoanRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Đăng nhập USER: sub = email, claim role = USER
    public String login(String email, String matkhau) {
        TaiKhoan taikhoan = taikhoanRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại"));

        if (!passwordEncoder.matches(matkhau, taikhoan.getMatKhauBam())) {
            throw new IllegalArgumentException("Mật khẩu không đúng");
        }
        // QUAN TRỌNG: thêm claim role=USER để JwtFilter chọn userService
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "USER");
        
        return jwtUtil.generateAccessToken(
                taikhoan.getEmail(),                    // subject
                claims                                   // claim role
        );
    }
}
