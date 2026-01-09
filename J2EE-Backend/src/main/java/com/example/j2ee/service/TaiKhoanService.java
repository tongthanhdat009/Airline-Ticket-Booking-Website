package com.example.j2ee.service;

import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.repository.TaiKhoanRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class TaiKhoanService {
    private static final String PASSWORD_PATTERN = "^[A-Z](?=.*[!@#$%^&*()_+\\-\\=\\[\\]{};':\"\\\\|,.<>\\/?]).{5,}$";
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private final PasswordEncoder passwordEncoder;
    private final TaiKhoanRepository taiKhoanRepository;
    
    public TaiKhoanService(PasswordEncoder passwordEncoder, TaiKhoanRepository taiKhoanRepository) {
        this.passwordEncoder = passwordEncoder;
        this.taiKhoanRepository = taiKhoanRepository;
    }

    // Đọc danh sách tài khoản
    public List<TaiKhoan> getAllTaiKhoan() {
        return taiKhoanRepository.findAll();
    }

    // Đọc chi tiết tài khoản theo ID
    public TaiKhoan getTaiKhoanById(int id) {
        return taiKhoanRepository.findById(id).orElse(null);
    }

    // Cập nhật tài khoản theo ID
    public TaiKhoan updateTaiKhoan(int id, TaiKhoan updated) {
        Optional<TaiKhoan> optional = taiKhoanRepository.findById(id);
        if (optional.isEmpty()) {
            return null; // hoặc ném exception tuỳ theo luồng xử lý của bạn
        }
        TaiKhoan existing = optional.get();

        // Nếu cung cấp email mới, kiểm tra định dạng và trùng
        if (updated.getEmail() != null) {
            if (!EMAIL_PATTERN.matcher(updated.getEmail()).matches()) {
                throw new IllegalArgumentException("Email không hợp lệ");
            }
            if (!updated.getEmail().equals(existing.getEmail()) && taiKhoanRepository.existsByEmail(updated.getEmail())) {
                throw new IllegalArgumentException("Email đã tồn tại");
            }
            existing.setEmail(updated.getEmail());
        }
        if (updated.getMatKhauBam() != null) {
            if (!updated.getMatKhauBam().matches(PASSWORD_PATTERN)) {
                throw new IllegalArgumentException("Mật khẩu không hợp lệ");
            }
            String hashedPassword = passwordEncoder.encode(updated.getMatKhauBam());
            existing.setMatKhauBam(hashedPassword);
        }
        if (updated.getTrangThai() != null) {
            existing.setTrangThai(updated.getTrangThai());
        }
        if (updated.getHanhKhach() != null) {
            existing.setHanhKhach(updated.getHanhKhach());
        }
        // Không sửa ngayTao ở đây

        return taiKhoanRepository.save(existing);
    }

    // Xoá tài khoản theo ID
    public boolean deleteTaiKhoan(int id) {
        if (!taiKhoanRepository.existsById(id)) {
            return false;
        }
        taiKhoanRepository.deleteById(id);
        return true;
    }
}
