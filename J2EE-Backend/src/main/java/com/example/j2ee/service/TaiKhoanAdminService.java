package com.example.j2ee.service;

import com.example.j2ee.dto.TaiKhoanAdminDTO;
import com.example.j2ee.model.AdminVaiTro;
import com.example.j2ee.model.AdminVaiTroId;
import com.example.j2ee.model.TaiKhoanAdmin;
import com.example.j2ee.model.VaiTro;
import com.example.j2ee.repository.AdminVaiTroRepository;
import com.example.j2ee.repository.TaiKhoanAdminRepository;
import com.example.j2ee.repository.VaiTroRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaiKhoanAdminService {
    private final TaiKhoanAdminRepository taiKhoanAdminRepository;
    private final AdminVaiTroRepository adminVaiTroRepository;
    private final VaiTroRepository vaiTroRepository;
    private final PasswordEncoder passwordEncoder;


    public TaiKhoanAdminService(
            TaiKhoanAdminRepository taiKhoanAdminRepository,
            AdminVaiTroRepository adminVaiTroRepository,
            VaiTroRepository vaiTroRepository,
            PasswordEncoder passwordEncoder) {
        this.taiKhoanAdminRepository = taiKhoanAdminRepository;
        this.adminVaiTroRepository = adminVaiTroRepository;
        this.vaiTroRepository = vaiTroRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Lấy tất cả tài khoản admin kèm vai trò
     */
    public List<TaiKhoanAdminDTO> getAllTaiKhoan() {
        List<TaiKhoanAdmin> accounts = taiKhoanAdminRepository.findAll();
        return accounts.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * Chuyển đổi TaiKhoanAdmin sang DTO
     */
    private TaiKhoanAdminDTO convertToDTO(TaiKhoanAdmin taiKhoan) {
        // Lấy danh sách vai trò từ AdminVaiTro
        List<AdminVaiTro> adminVaiTros = adminVaiTroRepository.findById_Mataikhoan(taiKhoan.getMaTaiKhoan());
        
        List<Integer> vaiTroIds = new ArrayList<>();
        List<String> vaiTroNames = new ArrayList<>();
        
        for (AdminVaiTro avt : adminVaiTros) {
            VaiTro vaiTro = avt.getVaiTro();
            if (vaiTro != null) {
                vaiTroIds.add(vaiTro.getMaVaiTro());
                vaiTroNames.add(vaiTro.getTenVaiTro());
            }
        }
        
        return new TaiKhoanAdminDTO(
            taiKhoan.getMaTaiKhoan(),
            taiKhoan.getTenDangNhap(),
            taiKhoan.getEmail(),
            taiKhoan.getHoVaTen(),
            taiKhoan.getNgayTao(),
            vaiTroIds,
            vaiTroNames
        );
    }

    public java.util.Optional<TaiKhoanAdmin> getTaiKhoanById(int id) {
        return taiKhoanAdminRepository.findById(id);
    }

    private static final String PASSWORD_PATTERN = "^[A-Z](?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).{5,}$";
    public TaiKhoanAdmin createTaiKhoan(TaiKhoanAdmin taiKhoanAdmin) {
        // Trim dữ liệu đầu vào
        if (taiKhoanAdmin.getTenDangNhap() != null) {
            taiKhoanAdmin.setTenDangNhap(taiKhoanAdmin.getTenDangNhap().trim());
        }
        if (taiKhoanAdmin.getEmail() != null) {
            taiKhoanAdmin.setEmail(taiKhoanAdmin.getEmail().trim().toLowerCase());
        }
        if (taiKhoanAdmin.getHoVaTen() != null) {
            taiKhoanAdmin.setHoVaTen(taiKhoanAdmin.getHoVaTen().trim());
        }

        if (!StringUtils.hasText(taiKhoanAdmin.getTenDangNhap()) ||
                !StringUtils.hasText(taiKhoanAdmin.getEmail()) ||
                !StringUtils.hasText(taiKhoanAdmin.getMatKhauBam())) {
            throw new IllegalArgumentException("Tài khoản, email và mật khẩu không được để trống");
        }

        // Kiểm tra định dạng email trước
        if (!taiKhoanAdmin.getEmail().matches(EMAIL_PATTERN)) {
            throw new IllegalArgumentException("Email không đúng định dạng (ví dụ: user@example.com)");
        }

        // Kiểm tra tên đăng nhập đã tồn tại
        if (taiKhoanAdminRepository.existsByTenDangNhap(taiKhoanAdmin.getTenDangNhap())) {
            throw new IllegalArgumentException("Tên đăng nhập đã tồn tại trong hệ thống");
        }

        // Kiểm tra email đã tồn tại (chỉ kiểm tra active accounts)
        if (taiKhoanAdminRepository.existsByEmail(taiKhoanAdmin.getEmail())) {
            throw new IllegalArgumentException("Email đã tồn tại trong hệ thống");
        }

        // Validate mật khẩu
        if (!taiKhoanAdmin.getMatKhauBam().matches(PASSWORD_PATTERN)) {
            throw new IllegalArgumentException("Mật khẩu phải bắt đầu bằng chữ in hoa, có ít nhất 6 ký tự và chứa ít nhất một ký tự đặc biệt");
        }

        // Encode password before saving
        String hashedPassword = passwordEncoder.encode(taiKhoanAdmin.getMatKhauBam());
        taiKhoanAdmin.setMatKhauBam(hashedPassword);

        taiKhoanAdmin.setNgayTao(LocalDateTime.now());
        taiKhoanAdmin.setDaXoa(false);
        
        try {
            return taiKhoanAdminRepository.save(taiKhoanAdmin);
        } catch (Exception e) {
            // Nếu có lỗi constraint từ database, ném exception rõ ràng
            if (e.getMessage() != null && e.getMessage().contains("UK_email_quantri")) {
                throw new IllegalArgumentException("Email đã tồn tại trong hệ thống");
            } else if (e.getMessage() != null && e.getMessage().contains("UK_tendangnhap")) {
                throw new IllegalArgumentException("Tên đăng nhập đã tồn tại trong hệ thống");
            }
            throw e;
        }
    }

    @Transactional
    public void deleteTaiKhoan(int id) {
        TaiKhoanAdmin taiKhoanAdmin = taiKhoanAdminRepository.findById(id).orElse(null);
        if (taiKhoanAdmin == null) {
            throw new IllegalArgumentException("Tài khoản không tồn tại");
        }

        // Xóa tất cả vai trò được gán cho tài khoản trước
        adminVaiTroRepository.deleteById_Mataikhoan(id);

        // Soft delete - JPA sẽ tự động sử dụng @SQLDelete annotation
        // Nó sẽ set da_xoa = 1 và deleted_at = NOW()
        taiKhoanAdminRepository.delete(taiKhoanAdmin);
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

    // Email regex pattern
    private static final String EMAIL_PATTERN = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";

    public TaiKhoanAdmin updateTaiKhoan(int id, TaiKhoanAdmin taiKhoanAdmin) {
        TaiKhoanAdmin existingTaiKhoan = taiKhoanAdminRepository.findById(id).orElse(null);
        if (existingTaiKhoan == null) {
            throw new IllegalArgumentException("Tài khoản không tồn tại");
        }

        // KHÔNG CHO PHÉP SỬA TÊN ĐĂNG NHẬP
        if (taiKhoanAdmin.getTenDangNhap() != null &&
            !taiKhoanAdmin.getTenDangNhap().equals(existingTaiKhoan.getTenDangNhap())) {
            throw new IllegalArgumentException("Không được phép thay đổi tên đăng nhập");
        }

        // Validate và cập nhật email
        if (taiKhoanAdmin.getEmail() != null && !taiKhoanAdmin.getEmail().isEmpty()) {
            // Trim và lowercase email để tránh khoảng trắng thừa và phân biệt hoa thường
            String newEmail = taiKhoanAdmin.getEmail().trim().toLowerCase();
            
            // Kiểm tra định dạng email
            if (!newEmail.matches(EMAIL_PATTERN)) {
                throw new IllegalArgumentException("Email không đúng định dạng (ví dụ: user@example.com)");
            }

            // Kiểm tra email đã tồn tại chưa (nếu email thay đổi)
            if (!newEmail.equals(existingTaiKhoan.getEmail())) {
                // Kiểm tra email đã được sử dụng bởi tài khoản active khác (loại trừ tài khoản hiện tại)
                if (taiKhoanAdminRepository.existsByEmailExcludingId(newEmail, id)) {
                    throw new IllegalArgumentException("Email này đã được sử dụng bởi tài khoản khác");
                }
                
                existingTaiKhoan.setEmail(newEmail);
            }
        }

        // Validate và cập nhật mật khẩu (chỉ khi được cung cấp)
        if (taiKhoanAdmin.getMatKhauBam() != null && !taiKhoanAdmin.getMatKhauBam().isEmpty()) {
            if (!taiKhoanAdmin.getMatKhauBam().matches(PASSWORD_PATTERN)) {
                throw new IllegalArgumentException("Mật khẩu phải bắt đầu bằng chữ in hoa, có ít nhất 6 ký tự và chứa ít nhất một ký tự đặc biệt");
            }
            // Encode password before saving
            String hashedPassword = passwordEncoder.encode(taiKhoanAdmin.getMatKhauBam());
            existingTaiKhoan.setMatKhauBam(hashedPassword);
        }

        // Cập nhật họ và tên
        if (taiKhoanAdmin.getHoVaTen() != null && !taiKhoanAdmin.getHoVaTen().isEmpty()) {
            existingTaiKhoan.setHoVaTen(taiKhoanAdmin.getHoVaTen().trim());
        }

        try {
            return taiKhoanAdminRepository.save(existingTaiKhoan);
        } catch (Exception e) {
            // Nếu có lỗi constraint từ database, ném exception rõ ràng
            if (e.getMessage() != null && e.getMessage().contains("UK_email_quantri")) {
                throw new IllegalArgumentException("Email này đã được sử dụng bởi tài khoản khác");
            } else if (e.getMessage() != null && e.getMessage().contains("UK_tendangnhap")) {
                throw new IllegalArgumentException("Tên đăng nhập này đã tồn tại trong hệ thống");
            }
            throw e;
        }
    }

    /**
     * Gán vai trò cho tài khoản admin
     * @param maTaiKhoan Mã tài khoản admin
     * @param vaiTroIds Danh sách mã vai trò cần gán
     */
    @Transactional
    public void assignRolesToAccount(int maTaiKhoan, List<Integer> vaiTroIds) {
        // Kiểm tra tài khoản tồn tại
        TaiKhoanAdmin taiKhoan = taiKhoanAdminRepository.findById(maTaiKhoan)
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản không tồn tại"));

        // Xóa tất cả vai trò hiện tại của tài khoản
        adminVaiTroRepository.deleteById_Mataikhoan(maTaiKhoan);

        // Gán vai trò mới
        if (vaiTroIds != null && !vaiTroIds.isEmpty()) {
            for (Integer maVaiTro : vaiTroIds) {
                // Kiểm tra vai trò tồn tại
                VaiTro vaiTro = vaiTroRepository.findById(maVaiTro)
                        .orElseThrow(() -> new IllegalArgumentException("Vai trò có mã " + maVaiTro + " không tồn tại"));

                // Tạo AdminVaiTroId
                AdminVaiTroId id = new AdminVaiTroId(maTaiKhoan, maVaiTro);

                // Tạo AdminVaiTro mới
                AdminVaiTro adminVaiTro = new AdminVaiTro();
                adminVaiTro.setId(id);
                adminVaiTro.setTaiKhoanAdmin(taiKhoan);
                adminVaiTro.setVaiTro(vaiTro);

                adminVaiTroRepository.save(adminVaiTro);
            }
        }
    }

    /**
     * Thêm một vai trò cho tài khoản admin
     * @param maTaiKhoan Mã tài khoản admin
     * @param maVaiTro Mã vai trò cần thêm
     */
    @Transactional
    public void addRoleToAccount(int maTaiKhoan, int maVaiTro) {
        // Kiểm tra tài khoản tồn tại
        TaiKhoanAdmin taiKhoan = taiKhoanAdminRepository.findById(maTaiKhoan)
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản không tồn tại"));

        // Kiểm tra vai trò tồn tại
        VaiTro vaiTro = vaiTroRepository.findById(maVaiTro)
                .orElseThrow(() -> new IllegalArgumentException("Vai trò không tồn tại"));

        // Kiểm tra xem vai trò đã được gán chưa
        if (adminVaiTroRepository.existsById_MataikhoanAndId_MaVaiTro(maTaiKhoan, maVaiTro)) {
            throw new IllegalArgumentException("Vai trò này đã được gán cho tài khoản");
        }

        // Tạo AdminVaiTro mới
        AdminVaiTroId id = new AdminVaiTroId(maTaiKhoan, maVaiTro);
        AdminVaiTro adminVaiTro = new AdminVaiTro();
        adminVaiTro.setId(id);
        adminVaiTro.setTaiKhoanAdmin(taiKhoan);
        adminVaiTro.setVaiTro(vaiTro);

        adminVaiTroRepository.save(adminVaiTro);
    }

    /**
     * Xóa một vai trò khỏi tài khoản admin
     * @param maTaiKhoan Mã tài khoản admin
     * @param maVaiTro Mã vai trò cần xóa
     */
    public void removeRoleFromAccount(int maTaiKhoan, int maVaiTro) {
        // Kiểm tra tài khoản tồn tại
        if (!taiKhoanAdminRepository.existsById(maTaiKhoan)) {
            throw new IllegalArgumentException("Tài khoản không tồn tại");
        }

        // Kiểm tra xem vai trò đã được gán chưa
        if (!adminVaiTroRepository.existsById_MataikhoanAndId_MaVaiTro(maTaiKhoan, maVaiTro)) {
            throw new IllegalArgumentException("Vai trò này chưa được gán cho tài khoản");
        }

        // Xóa vai trò
        AdminVaiTroId id = new AdminVaiTroId(maTaiKhoan, maVaiTro);
        adminVaiTroRepository.deleteById(id);
    }
}
