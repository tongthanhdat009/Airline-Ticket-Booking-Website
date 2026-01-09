package com.example.j2ee.service;

import com.example.j2ee.dto.datcho.DatChoDetailResponse;
import com.example.j2ee.dto.datcho.ThanhToanInfo;
import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.DatChoDichVu;
import com.example.j2ee.model.TrangThaiThanhToan;
import com.example.j2ee.repository.DatChoDichVuRepository;
import com.example.j2ee.repository.DatChoRepository;
import com.example.j2ee.repository.TrangThaiThanhToanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DatChoService {

    private final DatChoRepository datChoRepository;
    private final TrangThaiThanhToanRepository trangThaiThanhToanRepository;
    private final DatChoDichVuRepository datChoDichVuRepository;

    /**
     * Lấy danh sách đặt chỗ theo mã hành khách
     */
    public List<DatCho> getDatChoByHanhKhach(int maHanhKhach) {
        return datChoRepository.findByHanhKhach_MaHanhKhach(maHanhKhach);
    }

    /**
     * Lấy chi tiết đặt chỗ theo mã đặt chỗ
     */
    public Optional<DatCho> getDatChoById(int maDatCho) {
        return datChoRepository.findById(maDatCho);
    }

    /**
     * Hủy giao dịch (giải phóng ghế trong chuyến bay và cập nhật trạng thái thanh toán thành Đã hủy)
     */
    @Transactional
    public void huyDatCho(int maDatCho) {
        DatCho datCho = datChoRepository.findById(maDatCho)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đặt chỗ"));
        
        // Lấy thông tin thanh toán
        TrangThaiThanhToan thanhToan = trangThaiThanhToanRepository.findByDatCho_MaDatCho(maDatCho);
        if (thanhToan == null) {
            throw new IllegalArgumentException("Không tìm thấy thông tin thanh toán");
        }
        
        // Kiểm tra đã thanh toán chưa
        if (thanhToan.getDaThanhToan() == 'Y') {
            throw new IllegalArgumentException("Không thể hủy đặt chỗ đã thanh toán");
        }
        
        // Kiểm tra đã hủy chưa
        if (thanhToan.getDaThanhToan() == 'H') {
            throw new IllegalArgumentException("Đặt chỗ này đã được hủy trước đó");
        }
        
        // Bước 1: Cập nhật trạng thái thanh toán thành 'H' (Đã hủy) TRƯỚC
        thanhToan.setDaThanhToan('H');
        trangThaiThanhToanRepository.save(thanhToan);
        trangThaiThanhToanRepository.flush();
        
        // Bước 2: Xóa các dịch vụ đã đặt liên quan
        List<DatChoDichVu> danhSachDichVu = datChoDichVuRepository.findByDatCho_MaDatCho(maDatCho);
        if (!danhSachDichVu.isEmpty()) {
            datChoDichVuRepository.deleteAll(danhSachDichVu);
            datChoDichVuRepository.flush();
        }
        
        // Bước 3: Giải phóng ghế (xóa đặt chỗ khỏi chuyến bay)
        datCho.setChiTietGhe(null);
        datChoRepository.save(datCho);
    }

    /**
     * Tìm kiếm đặt chỗ theo mã đặt chỗ và tên hành khách
     */
    public DatChoDetailResponse searchDatCho(int maDatCho, String tenHanhKhach) {
        List<DatCho> danhSachDatCho = datChoRepository.findByMaDatChoAndTenHanhKhach(maDatCho, tenHanhKhach);
        
        if (danhSachDatCho.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy đặt chỗ với thông tin này");
        }
        
        DatCho datCho = danhSachDatCho.get(0);
        
        // Tạo response với thông tin chi tiết
        DatChoDetailResponse response = new DatChoDetailResponse();
        response.setMaDatCho(datCho.getMaDatCho());
        response.setNgayDatCho(datCho.getNgayDatCho());
        response.setHanhKhach(datCho.getHanhKhach());
        response.setChiTietGhe(datCho.getChiTietGhe());
        
        // Thêm thông tin thanh toán
        if (datCho.getTrangThaiThanhToan() != null) {
            ThanhToanInfo thanhToanInfo = new ThanhToanInfo();
            thanhToanInfo.setSoTien(datCho.getTrangThaiThanhToan().getSoTien());
            thanhToanInfo.setDaThanhToan(datCho.getTrangThaiThanhToan().getDaThanhToan());
            thanhToanInfo.setNgayHetHan(datCho.getTrangThaiThanhToan().getNgayHetHan());
            response.setThanhToan(thanhToanInfo);
        }
        
        return response;
    }
}
