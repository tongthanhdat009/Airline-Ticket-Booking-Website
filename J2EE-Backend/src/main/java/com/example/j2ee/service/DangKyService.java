package com.example.j2ee.service;

import com.example.j2ee.model.HanhKhach;
import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.repository.HanhKhachRepository;
import com.example.j2ee.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.util.Date;
import java.util.regex.Pattern;


@Service
@RequiredArgsConstructor
public class DangKyService {

    private final HanhKhachRepository hanhKhachRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // Regex cho mật khẩu mạnh:
    // - Ít nhất 8 ký tự
    // - Chữ cái đầu tiên phải viết hoa
    // - Ít nhất 1 ký tự đặc biệt
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
        "^[A-Z][A-Za-z0-9@#$%^&+=!]*[@#$%^&+=!][A-Za-z0-9@#$%^&+=!]*$"
    );

    /**
     * Kiểm tra email đã tồn tại chưa
     */
    public boolean checkEmailExists(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return taiKhoanRepository.existsByEmail(email);
    }

    /**
     * Kiểm tra số điện thoại đã tồn tại chưa
     */
    public boolean checkPhoneExists(String soDienThoai) {
        if (soDienThoai == null || soDienThoai.trim().isEmpty()) {
            return false;
        }
        return hanhKhachRepository.existsBySoDienThoai(soDienThoai);
    }

    public void dangKy(String hoVaTen, String email, String soDienThoai, String ngaySinh, String matKhau) {
        // Validation: Họ và tên
        if (hoVaTen == null || hoVaTen.trim().isEmpty()) {
            throw new IllegalArgumentException("Họ và tên không được để trống.");
        }

        // Validation: Email
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email không được để trống.");
        }
        String emailRegex = "^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$";
        if (!Pattern.matches(emailRegex, email)) {
            throw new IllegalArgumentException("Email không đúng định dạng.");
        }
        if (taiKhoanRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email đã được sử dụng.");
        }

        // Validation: Số điện thoại
        if (soDienThoai == null || soDienThoai.trim().isEmpty()) {
            throw new IllegalArgumentException("Số điện thoại không được để trống.");
        }
        String phoneRegex = "^[0-9]{10,11}$";
        if (!Pattern.matches(phoneRegex, soDienThoai)) {
            throw new IllegalArgumentException("Số điện thoại phải có 10-11 chữ số.");
        }
        if (hanhKhachRepository.existsBySoDienThoai(soDienThoai)) {
            throw new IllegalArgumentException("Số điện thoại đã được sử dụng.");
        }

        // Validation: Ngày sinh
        if (ngaySinh == null || ngaySinh.trim().isEmpty()) {
            throw new IllegalArgumentException("Ngày sinh không được để trống.");
        }

        // Parse và kiểm tra tuổi >= 18
        Date birthDate;
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            sdf.setLenient(false);
            birthDate = sdf.parse(ngaySinh);
        } catch (ParseException e) {
            throw new IllegalArgumentException("Định dạng ngày sinh không hợp lệ. Vui lòng sử dụng định dạng yyyy-MM-dd");
        }

        // Kiểm tra tuổi >= 18
        LocalDate localBirthDate = birthDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate currentDate = LocalDate.now();
        int age = Period.between(localBirthDate, currentDate).getYears();

        if (age < 18) {
            throw new IllegalArgumentException("Bạn phải từ 18 tuổi trở lên để đăng ký tài khoản.");
        }

        // Validation: Mật khẩu
        if (matKhau == null || matKhau.trim().isEmpty()) {
            throw new IllegalArgumentException("Mật khẩu không được để trống.");
        }
        if (matKhau.length() < 8) {
            throw new IllegalArgumentException("Mật khẩu phải có ít nhất 8 ký tự.");
        }
        // Kiểm tra ký tự đầu tiên viết hoa
        if (!Character.isUpperCase(matKhau.charAt(0))) {
            throw new IllegalArgumentException("Ký tự đầu tiên của mật khẩu phải viết hoa.");
        }
        // Kiểm tra có ít nhất 1 ký tự đặc biệt
        boolean hasSpecialChar = matKhau.matches(".*[@#$%^&+=!].*");
        if (!hasSpecialChar) {
            throw new IllegalArgumentException("Mật khẩu phải có ít nhất 1 ký tự đặc biệt (@#$%^&+=!).");
        }

        // 1) Tạo HanhKhach với đầy đủ thông tin
        HanhKhach hk = new HanhKhach();
        hk.setHoVaTen(hoVaTen);
        hk.setSoDienThoai(soDienThoai);
        hk.setNgaySinh(birthDate);

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
