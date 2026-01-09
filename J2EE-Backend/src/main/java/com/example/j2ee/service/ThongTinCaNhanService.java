package com.example.j2ee.service;

import com.example.j2ee.dto.UpdateThongTinCaNhanRequest;
import com.example.j2ee.model.HanhKhach;
import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.repository.HanhKhachRepository;
import com.example.j2ee.repository.TaiKhoanRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;

@Service
public class ThongTinCaNhanService {
    // Repository giao tiếp DB (đã inject qua constructor)
    private final TaiKhoanRepository taikhoanRepository;
    private final HanhKhachRepository hanhKhachRepository;

    // Constructor injection: Spring sẽ truyền vào 1 bean TaiKhoanRepository
    public ThongTinCaNhanService(TaiKhoanRepository taikhoanRepository,
                                HanhKhachRepository hanhKhachRepository) {
        this.taikhoanRepository = taikhoanRepository;
        this.hanhKhachRepository = hanhKhachRepository;
    }

    public Map<String, Object> myProfile(String email) {

        // Gọi repo: findEmailAndNameByEmail(email) phải là method thực thi SELECT 8 cột.
        var rows = taikhoanRepository.findEmailAndNameByEmail(email);

        // Không có bản ghi nào -> ném lỗi 
        if (rows.isEmpty()) throw new IllegalArgumentException("Không tìm thấy hồ sơ");

        // Lấy hàng đầu tiên (vì LIMIT 1)
        Object[] r = rows.get(0);

        if (r.length != 8) {
            throw new IllegalStateException("Query trả " + r.length + " cột");
        }

        // Map kết quả theo đúng thứ tự cột đã SELECT
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("email",        r[0]); // tk.email
        m.put("hovaten",      r[1]); // hk.hovaten
        m.put("ngaysinh",     r[2]); // hk.ngaysinh
        m.put("gioitinh",     r[3]); // hk.gioitinh
        m.put("sodienthoai",  r[4]); // hk.sodienthoai
        m.put("madinhdanh",   r[5]); // hk.madinhdanh
        m.put("diachi",       r[6]); // hk.diachi
        m.put("quocgia",      r[7]); // hk.quocgia

        return m;
    }

    /**
     * Cập nhật thông tin cá nhân của khách hàng đang đăng nhập.
     *
     * @param email Email của tài khoản (xác định ai đang update)
     * @param request DTO chứa dữ liệu muốn update (có thể không đầy đủ tất cả field)
     * @return Map chứa thông tin đã update
     */
    @Transactional
    public Map<String, Object> updateProfile(String email, UpdateThongTinCaNhanRequest request) {
        // Tìm tài khoản
        Optional<TaiKhoan> optTk = taikhoanRepository.findByEmail(email);
        if (optTk.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy tài khoản");
        }

        TaiKhoan taiKhoan = optTk.get();
        HanhKhach hanhKhach = taiKhoan.getHanhKhach();

        if (hanhKhach == null) {
            throw new IllegalStateException("Tài khoản không có hành khách liên kết");
        }

        // Cập nhật các field nếu được gửi lên (không null)
        if (StringUtils.hasText(request.getHoVaTen())) {
            hanhKhach.setHoVaTen(request.getHoVaTen());
        }

        if (StringUtils.hasText(request.getGioiTinh())) {
            hanhKhach.setGioiTinh(request.getGioiTinh());
        }

        if (request.getNgaySinh() != null) {
            hanhKhach.setNgaySinh(request.getNgaySinh());
        }

        if (StringUtils.hasText(request.getQuocGia())) {
            hanhKhach.setQuocGia(request.getQuocGia());
        }

        if (StringUtils.hasText(request.getSoDienThoai())) {
            hanhKhach.setSoDienThoai(request.getSoDienThoai());
        }

        if (StringUtils.hasText(request.getMaDinhDanh())) {
            hanhKhach.setMaDinhDanh(request.getMaDinhDanh());
        }

        if (StringUtils.hasText(request.getDiaChi())) {
            hanhKhach.setDiaChi(request.getDiaChi());
        }

        // Lưu vào DB
        hanhKhachRepository.save(hanhKhach);

        // Trả về thông tin đã update
        return myProfile(email);
    }
}
