package com.example.j2ee.service;

import com.example.j2ee.model.SanBay;
import com.example.j2ee.model.TuyenBay;
import com.example.j2ee.repository.ChiTietChuyenBayRepository;
import com.example.j2ee.repository.GiaChuyenBayRepository;
import com.example.j2ee.repository.SanBayRepository;
import com.example.j2ee.repository.TuyenBayRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TuyenBayService {
    private final TuyenBayRepository tuyenBayRepository;
    private final SanBayRepository sanBayRepository;
    private final ChiTietChuyenBayRepository chiTietChuyenBayRepository;
    private final GiaChuyenBayRepository giaChuyenBayRepository;

    public TuyenBayService(TuyenBayRepository tuyenBayRepository,
                           SanBayRepository sanBayRepository,
                           ChiTietChuyenBayRepository chiTietChuyenBayRepository,
                           GiaChuyenBayRepository giaChuyenBayRepository) {
        this.tuyenBayRepository = tuyenBayRepository;
        this.sanBayRepository = sanBayRepository;
        this.chiTietChuyenBayRepository = chiTietChuyenBayRepository;
        this.giaChuyenBayRepository = giaChuyenBayRepository;
    }

    public List<TuyenBay> getAllTuyenBay() {
        return tuyenBayRepository.findAll();
    }

    public TuyenBay getTuyenBayById(int id) {
        return tuyenBayRepository.findById(id).orElse(null);
    }

    public TuyenBay createTuyenBay(TuyenBay tb){
        if (tb == null || tb.getSanBayDi() == null || tb.getSanBayDen() == null) {
            return null;
        }
        int maSanBayDi = tb.getSanBayDi().getMaSanBay();
        int maSanBayDen = tb.getSanBayDen().getMaSanBay();
        if (maSanBayDi == maSanBayDen) {
            return null;
        }
        boolean existsDi = sanBayRepository.existsById(maSanBayDi);
        boolean existsDen = sanBayRepository.existsById(maSanBayDen);
        if (!existsDi || !existsDen) {
            return null;
        }

        // Kiểm tra tuyến bay có bị trùng cả sân bay đến và đi chưa
        if (tuyenBayRepository.existsBySanBayDi_MaSanBayAndSanBayDen_MaSanBay(maSanBayDi, maSanBayDen)) {
            return null; // Tuyến bay này đã tồn tại
        }

        return tuyenBayRepository.save(tb);
    }

    public String deleteTuyenBay(int id) {
        // Kiểm tra tuyến bay có tồn tại không
        if (!tuyenBayRepository.existsById(id)) {
            return "Tuyến bay không tồn tại";
        }

        // Kiểm tra tuyến bay có tồn tại trong bảng ChiTietChuyenBay không
        if (chiTietChuyenBayRepository.existsByTuyenBay_MaTuyenBay(id)) {
            return "Không thể xóa tuyến bay vì đang có chuyến bay sử dụng tuyến này";
        }

        // Kiểm tra tuyến bay có tồn tại trong bảng GiaChuyenBay không
        if (giaChuyenBayRepository.existsByTuyenBay_MaTuyenBay(id)) {
            return "Không thể xóa tuyến bay vì đang có giá chuyến bay liên quan";
        }

        try {
            tuyenBayRepository.deleteById(id);
            return null; // null nghĩa là xóa thành công
        } catch (Exception e) {
            return "Lỗi khi xóa tuyến bay: " + e.getMessage();
        }
    }

    public String updateTuyenBay(TuyenBay tb) {
        // Kiểm tra dữ liệu đầu vào
        if (tb == null || tb.getSanBayDi() == null || tb.getSanBayDen() == null) {
            return "Thông tin tuyến bay không hợp lệ";
        }

        // Kiểm tra tuyến bay có tồn tại không
        if (!tuyenBayRepository.existsById(tb.getMaTuyenBay())) {
            return "Tuyến bay không tồn tại";
        }

        int maSanBayDi = tb.getSanBayDi().getMaSanBay();
        int maSanBayDen = tb.getSanBayDen().getMaSanBay();

        // Kiểm tra sân bay đi và sân bay đến có giống nhau không
        if (maSanBayDi == maSanBayDen) {
            return "Sân bay đi và sân bay đến không được giống nhau";
        }

        // Kiểm tra sân bay có tồn tại khônG
        SanBay existsDi = sanBayRepository.findByMaSanBay((maSanBayDi));
        SanBay existsDen = sanBayRepository.findByMaSanBay(maSanBayDen);
        if (existsDi == null || existsDen == null) {
            return "Sân bay không tồn tại trong hệ thống";
        }
        if (!existsDi.getTrangThaiHoatDong().equals("ACTIVE") ||
            !existsDen.getTrangThaiHoatDong().equals("ACTIVE")) {
            return "Sân bay phải ở trạng thái ACTIVE";
        }


        // Kiểm tra tuyến bay có trùng với tuyến bay khác không (loại trừ chính nó)
        if (tuyenBayRepository.existsBySanBayDi_MaSanBayAndSanBayDen_MaSanBayAndMaTuyenBayNot(
                maSanBayDi, maSanBayDen, tb.getMaTuyenBay())) {
            return "Tuyến bay này đã tồn tại trong hệ thống";
        }

        try {
            tuyenBayRepository.save(tb);
            return null; // null nghĩa là cập nhật thành công
        } catch (Exception e) {
            return "Lỗi khi cập nhật tuyến bay: " + e.getMessage();
        }
    }
}