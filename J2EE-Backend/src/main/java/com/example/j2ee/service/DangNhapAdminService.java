package com.example.j2ee.service;

import com.example.j2ee.model.TaiKhoanAdmin;
import com.example.j2ee.jwt.JwtUtil;
import com.example.j2ee.repository.TaiKhoanAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class DangNhapAdminService {

    private final TaiKhoanAdminRepository taiKhoanAdminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public String loginAdmin(String tenDangNhap, String matKhau) {
        TaiKhoanAdmin tk = taiKhoanAdminRepository.findByTenDangNhap(tenDangNhap)
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản này không tồn tại"));

        if(!passwordEncoder.matches(matKhau, tk.getMatKhauBam())){
            throw new IllegalArgumentException("Mật khẩu không đúng");
        }
        // QUAN TRỌNG: sub = tenDangNhap, kèm claim role=ADMIN để JwtFilter chọn adminService
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "ADMIN");
        return jwtUtil.generateAccessToken(tk.getTenDangNhap(), claims);
    }
}
