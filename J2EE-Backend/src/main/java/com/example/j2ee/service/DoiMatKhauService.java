package com.example.j2ee.service;

import com.example.j2ee.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class DoiMatKhauService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final PasswordEncoder passwordEncoder;

    // Bảo vệ tính toàn vẹn: mọi rule nằm ở đây
    @Transactional
    public void thayDoiMatKhau(String email,
                               String currentPassword,
                               String newPassword,
                               String confirmNewPassword) {

        var user = taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản"));

        // 0) Kiểm tra rỗng
        if (!StringUtils.hasText(currentPassword)) {
            throw new IllegalArgumentException( "Vui lòng nhập mật khẩu hiện tại");
        }
        if (!StringUtils.hasText(newPassword)) {
            throw new IllegalArgumentException( "Mật khẩu mới không được để trống");
        }
        if (!StringUtils.hasText(confirmNewPassword)) {
            throw new IllegalArgumentException( "Vui lòng nhập xác nhận mật khẩu");
        }

        // 1) So khớp mật khẩu mới & xác nhận
        if (!newPassword.equals(confirmNewPassword)) {
            throw new IllegalArgumentException("Mật khẩu nhập lại không khớp!");
        }

        // 2) Mật khẩu hiện tại đúng?
        if (!passwordEncoder.matches(currentPassword, user.getMatKhauBam())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không đúng!");
        }

        // 3) Không cho trùng mật khẩu cũ
        if (passwordEncoder.matches(newPassword, user.getMatKhauBam())) {
            throw new IllegalArgumentException( "Mật khẩu mới không được trùng với mật khẩu cũ!");
        }

        // 4) Độ dài/độ mạnh (ví dụ)
        if (newPassword.length() < 6) {
            throw new IllegalArgumentException( "Mật khẩu phải có ít nhất 6 ký tự!");
        }

        // 5) Lưu
        user.setMatKhauBam(passwordEncoder.encode(newPassword));
        taiKhoanRepository.save(user);
    }
}
