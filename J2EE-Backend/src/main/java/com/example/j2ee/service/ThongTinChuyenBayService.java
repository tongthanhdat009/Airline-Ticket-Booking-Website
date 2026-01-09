package com.example.j2ee.service;

import com.example.j2ee.model.ChiTietChuyenBay;
import com.example.j2ee.model.ChiTietGhe;
import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.model.TrangThaiThanhToan;
import com.example.j2ee.repository.DatChoRepository;
import com.example.j2ee.repository.TaiKhoanRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ThongTinChuyenBayService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final DatChoRepository datChoRepository;

    public ThongTinChuyenBayService(TaiKhoanRepository taiKhoanRepository,
                                   DatChoRepository datChoRepository) {
        this.taiKhoanRepository = taiKhoanRepository;
        this.datChoRepository = datChoRepository;
    }

    /**
     * @param email Email của tài khoản đang đăng nhập
     * @return List các map chứa thông tin chuyến bay + trạng thái thanh toán
     */
    @Transactional
    public List<Map<String, Object>> getChuyenBayTheoKhachHang(String email) {
        // Bước 1: Từ email tìm taikhoan
        Optional<TaiKhoan> optTk = taiKhoanRepository.findByEmail(email);
        if (optTk.isEmpty()) {
            return Collections.emptyList();
        }

        TaiKhoan taiKhoan = optTk.get();

        // Kiểm tra hành khách có được liên kết không
        if (taiKhoan.getHanhKhach() == null) {
            return Collections.emptyList();
        }

        int maHanhKhach = taiKhoan.getHanhKhach().getMaHanhKhach();

        // Bước 2: Từ mahanhkhach tìm danh sách đặt chỗ
        List<DatCho> danhSachDatCho = datChoRepository.findByHanhKhach_MaHanhKhach(maHanhKhach);

        // Bước 3: Với mỗi đặt chỗ, lấy thông tin chuyến bay
        List<Map<String, Object>> result = new ArrayList<>();

        for (DatCho datCho : danhSachDatCho) {
            Map<String, Object> map = new LinkedHashMap<>();

            // Thêm thông tin đặt chỗ
            map.put("maDatCho", datCho.getMaDatCho());
            map.put("ngayDatCho", datCho.getNgayDatCho());

            // Bước 4: Lấy chitiêtghe
            ChiTietGhe chiTietGhe = datCho.getChiTietGhe();
            if (chiTietGhe != null) {
                // Lấy thông tin hạng vé
                if (chiTietGhe.getHangVe() != null) {
                    map.put("maHangVe", chiTietGhe.getHangVe().getMaHangVe());
                    map.put("tenHangVe", chiTietGhe.getHangVe().getTenHangVe());
                }

                // Bước 5: Lấy chitietchuyenbay từ ghế
                ChiTietChuyenBay chiTietChuyenBay = chiTietGhe.getChiTietChuyenBay();
                if (chiTietChuyenBay != null) {
                    map.put("maChuyenBay", chiTietChuyenBay.getMaChuyenBay());
                    map.put("soHieuChuyenBay", chiTietChuyenBay.getSoHieuChuyenBay());
                    map.put("ngayDi", chiTietChuyenBay.getNgayDi());
                    map.put("gioDi", chiTietChuyenBay.getGioDi());
                    map.put("ngayDen", chiTietChuyenBay.getNgayDen());
                    map.put("gioDen", chiTietChuyenBay.getGioDen());

                    // Lấy thông tin tuyến bay (nếu có)
                    if (chiTietChuyenBay.getTuyenBay() != null) {
                        map.put("maTuyenBay", chiTietChuyenBay.getTuyenBay().getMaTuyenBay());
                        map.put("sanbayDi", chiTietChuyenBay.getTuyenBay().getSanBayDi());
                        map.put("sanbayDen", chiTietChuyenBay.getTuyenBay().getSanBayDen());
                    }
                }
            }

            // Bước 6: Lấy trangthaithanhtoan
            TrangThaiThanhToan trangThaiThanhToan = datCho.getTrangThaiThanhToan();
            if (trangThaiThanhToan != null) {
                map.put("maThanhToan", trangThaiThanhToan.getMaThanhToan());
                map.put("daThanhToan", trangThaiThanhToan.getDaThanhToan());
                map.put("soTien", trangThaiThanhToan.getSoTien());
                map.put("ngayHetHan", trangThaiThanhToan.getNgayHetHan());
            }

            result.add(map);
        }

        return result;
    }
}
