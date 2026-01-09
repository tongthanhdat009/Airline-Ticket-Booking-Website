package com.example.j2ee.service;

import com.example.j2ee.model.HanhKhach;
import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.repository.HanhKhachRepository;
import com.example.j2ee.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;


@Service
@RequiredArgsConstructor
public class DangKyService {

    private final HanhKhachRepository hanhKhachRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public void dangKy(String hoVaTen, String email, String soDienThoai, String ngaySinh, String matKhau) {
        if (hoVaTen == null || hoVaTen.trim().isEmpty()) {
            throw new IllegalArgumentException("Họ và tên không được để trống.");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email không được để trống.");
        }
        if (taiKhoanRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email đã được sử dụng.");
        }
        if (soDienThoai == null || soDienThoai.trim().isEmpty()) {
            throw new IllegalArgumentException("Số điện thoại không được để trống.");
        }
        if (ngaySinh == null || ngaySinh.trim().isEmpty()) {
            throw new IllegalArgumentException("Ngày sinh không được để trống.");
        }
        if (matKhau == null || matKhau.length() < 6) {
            throw new IllegalArgumentException("Mật khẩu phải từ 6 ký tự.");
        }

        // 1) Tạo HanhKhach với đầy đủ thông tin
        HanhKhach hk = new HanhKhach();
        hk.setHoVaTen(hoVaTen);
        hk.setSoDienThoai(soDienThoai);
        
        // Parse ngày sinh từ String sang Date
        try {
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
            hk.setNgaySinh(sdf.parse(ngaySinh));
        } catch (Exception e) {
            throw new IllegalArgumentException("Định dạng ngày sinh không hợp lệ. Vui lòng sử dụng định dạng yyyy-MM-dd");
        }
        
        HanhKhach savedHK = hanhKhachRepository.save(hk);

        // 2) Tạo TaiKhoan liên kết HanhKhach
        TaiKhoan tk = new TaiKhoan();
        tk.setEmail(email);
        tk.setMatKhauBam(passwordEncoder.encode(matKhau));
        tk.setNgayTao(new Date());
        tk.setTrangThai("ACTIVE");
        tk.setHanhKhach(savedHK);

        taiKhoanRepository.save(tk);
        
        // 3) Gửi email chào mừng
        try {
            emailService.sendWelcomeEmail(email, hoVaTen);
        } catch (Exception e) {
            // Log error but don't fail registration
            System.err.println("Không thể gửi email chào mừng: " + e.getMessage());
        }
    }
}




