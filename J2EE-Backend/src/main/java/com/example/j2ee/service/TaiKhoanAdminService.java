package com.example.j2ee.service;

import com.example.j2ee.model.TaiKhoanAdmin;
import com.example.j2ee.repository.TaiKhoanAdminRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaiKhoanAdminService {
    private final TaiKhoanAdminRepository taiKhoanAdminRepository;
    private final PasswordEncoder passwordEncoder;


    public TaiKhoanAdminService(TaiKhoanAdminRepository taiKhoanAdminRepository, PasswordEncoder passwordEncoder) {
        this.taiKhoanAdminRepository = taiKhoanAdminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<TaiKhoanAdmin> getAllTaiKhoan() {
        return taiKhoanAdminRepository.findAll();
    }

    public java.util.Optional<TaiKhoanAdmin> getTaiKhoanById(int id) {
        return taiKhoanAdminRepository.findById(id);
    }

    private static final String PASSWORD_PATTERN = "^[A-Z](?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).{5,}$";
    public TaiKhoanAdmin createTaiKhoan(TaiKhoanAdmin taiKhoanAdmin) {
        if (!StringUtils.hasText(taiKhoanAdmin.getTenDangNhap()) ||
                !StringUtils.hasText(taiKhoanAdmin.getEmail()) ||
                !StringUtils.hasText(taiKhoanAdmin.getMatKhauBam())) {
            throw new IllegalArgumentException("Tài khoản, email và mật khẩu không được để trống");
        }

        if (taiKhoanAdminRepository.existsByTenDangNhap(taiKhoanAdmin.getTenDangNhap())) {
            throw new IllegalArgumentException("Tài khoản đã tồn tại");
        }

        if (taiKhoanAdminRepository.existsByEmail(taiKhoanAdmin.getEmail())) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }

        if (taiKhoanAdmin.getTenDangNhap() == null || taiKhoanAdmin.getEmail() == null || taiKhoanAdmin.getMatKhauBam() == null) {
            throw new IllegalArgumentException("Tài khoản, email và mật khẩu không được để null");
        }

        if (!taiKhoanAdmin.getMatKhauBam().matches(PASSWORD_PATTERN)) {
            throw new IllegalArgumentException("Mật khẩu phải bắt đầu bằng chữ in hoa, có ít nhất 6 ký tự và chứa ít nhất một ký tự đặc biệt");
        }

        // Encode password before saving
        String hashedPassword = passwordEncoder.encode(taiKhoanAdmin.getMatKhauBam());
        taiKhoanAdmin.setMatKhauBam(hashedPassword);

        taiKhoanAdmin.setNgayTao(LocalDateTime.now());
        return taiKhoanAdminRepository.save(taiKhoanAdmin);
    }

    public void deleteTaiKhoan(int id) {
        TaiKhoanAdmin taiKhoanAdmin = taiKhoanAdminRepository.findById(id).orElse(null);
        if (taiKhoanAdmin != null) {
            taiKhoanAdminRepository.delete(taiKhoanAdmin);
        }
    }

    public List<TaiKhoanAdmin> searchTaiKhoan(String tenDangNhap, String email) {
        if (tenDangNhap != null && email != null) {
            return taiKhoanAdminRepository.findByTenDangNhapContainingAndEmailContaining(tenDangNhap, email);
        } else if (tenDangNhap != null) {
            return taiKhoanAdminRepository.findByTenDangNhapContaining(tenDangNhap);
        } else if (email != null) {
            return taiKhoanAdminRepository.findByEmailContaining(email);
        } else {
            return taiKhoanAdminRepository.findAll();
        }
    }

    public TaiKhoanAdmin updateTaiKhoan(int id, TaiKhoanAdmin taiKhoanAdmin) {
        TaiKhoanAdmin existingTaiKhoan = taiKhoanAdminRepository.findById(id).orElse(null);
        if (existingTaiKhoan == null) {
            throw new IllegalArgumentException("Tài khoản không tồn tại");
        }

        if (taiKhoanAdmin.getTenDangNhap() != null && !taiKhoanAdmin.getTenDangNhap().equals(existingTaiKhoan.getTenDangNhap())) {
            if (taiKhoanAdminRepository.existsByTenDangNhap(taiKhoanAdmin.getTenDangNhap())) {
                throw new IllegalArgumentException("Tài khoản đã tồn tại");
            }
            existingTaiKhoan.setTenDangNhap(taiKhoanAdmin.getTenDangNhap());
        }

        if (taiKhoanAdmin.getEmail() != null && !taiKhoanAdmin.getEmail().equals(existingTaiKhoan.getEmail())) {
            if (taiKhoanAdminRepository.existsByEmail(taiKhoanAdmin.getEmail())) {
                throw new IllegalArgumentException("Email đã tồn tại");
            }
            existingTaiKhoan.setEmail(taiKhoanAdmin.getEmail());
        }

        if (taiKhoanAdmin.getMatKhauBam() != null) {
            if (!taiKhoanAdmin.getMatKhauBam().matches(PASSWORD_PATTERN)) {
                throw new IllegalArgumentException("Mật khẩu phải bắt đầu bằng chữ in hoa, có ít nhất 6 ký tự và chứa ít nhất một ký tự đặc biệt");
            }
            // Encode password before saving
            String hashedPassword = passwordEncoder.encode(taiKhoanAdmin.getMatKhauBam());
            existingTaiKhoan.setMatKhauBam(hashedPassword);
        }

        return taiKhoanAdminRepository.save(existingTaiKhoan);
    }
}
