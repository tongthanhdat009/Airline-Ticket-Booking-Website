package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.TaiKhoanDTO;
import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.repository.TaiKhoanRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/taikhoan")
public class TaiKhoanController {

    private final TaiKhoanRepository taiKhoanRepository;
    private final PasswordEncoder passwordEncoder;

    public TaiKhoanController(TaiKhoanRepository taiKhoanRepository, PasswordEncoder passwordEncoder) {
        this.taiKhoanRepository = taiKhoanRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * API lấy thông tin tài khoản theo email
     * GET /taikhoan/email/{email}
     * Chỉ trả về thông tin công khai, không bao gồm mật khẩu và thông tin nhạy cảm
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<TaiKhoanDTO>> getTaiKhoanByEmail(@PathVariable String email) {
        Optional<TaiKhoan> taiKhoanOpt = taiKhoanRepository.findByEmail(email);

        if (taiKhoanOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy tài khoản với email: " + email));
        }

        TaiKhoan taiKhoan = taiKhoanOpt.get();

        // Chỉ trả về các thông tin cần thiết, loại bỏ thông tin nhạy cảm
        TaiKhoanDTO dto = new TaiKhoanDTO();
        dto.setMaTaiKhoan(taiKhoan.getMaTaiKhoan());
        dto.setEmail(taiKhoan.getEmail());
        dto.setNgayTao(taiKhoan.getNgayTao());
        dto.setTrangThai(taiKhoan.getTrangThai());
        dto.setEmailVerified(taiKhoan.isEmailVerified());

        // Thông tin hành khách - nested object để compatible với frontend
        if (taiKhoan.getHanhKhach() != null) {
            TaiKhoanDTO.HanhKhachNested hk = new TaiKhoanDTO.HanhKhachNested();
            hk.setMaHanhKhach(taiKhoan.getHanhKhach().getMaHanhKhach());
            hk.setHoVaTen(taiKhoan.getHanhKhach().getHoVaTen());
            hk.setGioiTinh(taiKhoan.getHanhKhach().getGioiTinh());
            hk.setNgaySinh(taiKhoan.getHanhKhach().getNgaySinh());
            hk.setSoDienThoai(taiKhoan.getHanhKhach().getSoDienThoai());
            hk.setMaDinhDanh(taiKhoan.getHanhKhach().getMaDinhDanh());
            hk.setDiaChi(taiKhoan.getHanhKhach().getDiaChi());
            hk.setQuocGia(taiKhoan.getHanhKhach().getQuocGia());
            hk.setEmail(taiKhoan.getHanhKhach().getEmail());
            dto.setHanhKhach(hk);
        }

        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin tài khoản thành công", dto));
    }

    /**
     * API cập nhật thông tin tài khoản
     * PUT /taikhoan/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaiKhoan>> updateTaiKhoan(
            @PathVariable int id, 
            @RequestBody Map<String, Object> updates) {
        
        Optional<TaiKhoan> optionalTaiKhoan = taiKhoanRepository.findById(id);
        
        if (optionalTaiKhoan.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy tài khoản với id: " + id));
        }
        
        TaiKhoan taiKhoan = optionalTaiKhoan.get();
        
        // Cập nhật thông tin hành khách nếu có
        if (updates.containsKey("hanhKhach") && taiKhoan.getHanhKhach() != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> hanhKhachData = (Map<String, Object>) updates.get("hanhKhach");
            
            if (hanhKhachData.containsKey("hoVaTen")) {
                taiKhoan.getHanhKhach().setHoVaTen((String) hanhKhachData.get("hoVaTen"));
            }
            if (hanhKhachData.containsKey("gioiTinh")) {
                taiKhoan.getHanhKhach().setGioiTinh((String) hanhKhachData.get("gioiTinh"));
            }
            if (hanhKhachData.containsKey("soDienThoai")) {
                taiKhoan.getHanhKhach().setSoDienThoai((String) hanhKhachData.get("soDienThoai"));
            }
            if (hanhKhachData.containsKey("maDinhDanh")) {
                taiKhoan.getHanhKhach().setMaDinhDanh((String) hanhKhachData.get("maDinhDanh"));
            }
            if (hanhKhachData.containsKey("diaChi")) {
                taiKhoan.getHanhKhach().setDiaChi((String) hanhKhachData.get("diaChi"));
            }
            if (hanhKhachData.containsKey("quocGia")) {
                taiKhoan.getHanhKhach().setQuocGia((String) hanhKhachData.get("quocGia"));
            }
            if (hanhKhachData.containsKey("ngaySinh")) {
                String ngaySinhStr = (String) hanhKhachData.get("ngaySinh");
                if (ngaySinhStr != null && !ngaySinhStr.trim().isEmpty()) {
                    try {
                        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
                        taiKhoan.getHanhKhach().setNgaySinh(sdf.parse(ngaySinhStr));
                    } catch (Exception e) {
                        return ResponseEntity.badRequest()
                                .body(ApiResponse.error("Định dạng ngày sinh không hợp lệ. Vui lòng sử dụng định dạng yyyy-MM-dd"));
                    }
                }
            }
        }
        
        TaiKhoan savedTaiKhoan = taiKhoanRepository.save(taiKhoan);
        
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin thành công", savedTaiKhoan));
    }

    /**
     * API đổi mật khẩu
     * POST /taikhoan/{id}/change-password
     */
    @PostMapping("/{id}/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @PathVariable int id,
            @RequestBody Map<String, String> passwordData) {
        
        String oldPassword = passwordData.get("oldPassword");
        String newPassword = passwordData.get("newPassword");
        
        if (oldPassword == null || oldPassword.trim().isEmpty() || 
            newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Mật khẩu cũ và mật khẩu mới không được để trống"));
        }
        
        Optional<TaiKhoan> optionalTaiKhoan = taiKhoanRepository.findById(id);
        
        if (optionalTaiKhoan.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy tài khoản"));
        }
        
        TaiKhoan taiKhoan = optionalTaiKhoan.get();
        
        // Kiểm tra nếu tài khoản đăng nhập qua OAuth2
        if (taiKhoan.getOauth2Provider() != null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Tài khoản OAuth2 không thể đổi mật khẩu"));
        }
        
        // Xác thực mật khẩu cũ
        if (!passwordEncoder.matches(oldPassword, taiKhoan.getMatKhauBam())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Mật khẩu cũ không chính xác"));
        }
        
        // Cập nhật mật khẩu mới
        taiKhoan.setMatKhauBam(passwordEncoder.encode(newPassword));
        taiKhoanRepository.save(taiKhoan);
        
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", "Password changed successfully"));
    }
}
