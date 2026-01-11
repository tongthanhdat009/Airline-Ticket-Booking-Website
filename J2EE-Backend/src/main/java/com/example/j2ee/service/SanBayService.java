package com.example.j2ee.service;

import com.example.j2ee.dto.ChuyenBayWithSeatsDTO;
import com.example.j2ee.model.ChiTietChuyenBay;
import com.example.j2ee.model.SanBay;
import com.example.j2ee.repository.ChiTietChuyenBayRepository;
import com.example.j2ee.repository.GheDaDatRepository;
import com.example.j2ee.repository.SanBayRepository;
import com.example.j2ee.repository.TuyenBayRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class SanBayService {
    private final SanBayRepository sanBayRepository;
    private final TuyenBayRepository tuyenBayRepository;
    private final ChiTietChuyenBayRepository chiTietChuyenBayRepository;
    private final GheDaDatRepository gheDaDatRepository;

    public SanBayService(SanBayRepository sanBayRepository,
                        TuyenBayRepository tuyenBayRepository,
                        ChiTietChuyenBayRepository chiTietChuyenBayRepository,
                        GheDaDatRepository gheDaDatRepository) {
        this.sanBayRepository = sanBayRepository;
        this.tuyenBayRepository = tuyenBayRepository;
        this.chiTietChuyenBayRepository = chiTietChuyenBayRepository;
        this.gheDaDatRepository = gheDaDatRepository;
    }

    public List<SanBay> getAllSanBay() {
        return sanBayRepository.findAll();
    }

    public List<SanBay> getActiveSanBay() {
        return sanBayRepository.findByTrangThaiHoatDong("ACTIVE");
    }

    public SanBay getSanBayByThanhPhoSanBay(String thanhPhoSanBay) {
        return sanBayRepository.findByThanhPhoSanBay(thanhPhoSanBay)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sân bay với thành phố: " + thanhPhoSanBay));  
    }

    public SanBay createSanBay(SanBay sanBay) {
        sanBay.setTrangThaiHoatDong("INACTIVE");
        return sanBayRepository.save(sanBay);
    }

    @Transactional
    public void deleteSanBay(int maSanBay) {
        // Kiểm tra xem sân bay có tồn tại không
        if (!sanBayRepository.existsById(maSanBay)) {
            throw new EntityNotFoundException("Không tìm thấy sân bay với mã: " + maSanBay);
        }

        // 2. Kiểm tra xem sân bay có đang được dùng trong tuyến bay nào không
        boolean isInUse = tuyenBayRepository.existsBySanBayDi_MaSanBayOrSanBayDen_MaSanBay(maSanBay, maSanBay);

        if (isInUse) {
            // 3. Nếu có, ném ra một exception với thông báo rõ ràng
            throw new IllegalStateException("Không thể xóa sân bay này vì đang được sử dụng trong một tuyến bay.");
        }

        // Nếu không có vấn đề gì, tiến hành xóa
        sanBayRepository.deleteById(maSanBay);
    }

    @Transactional
    public SanBay updateTrangThaiSanBay(int maSanBay, String trangThaiMoi) {
        // Kiểm tra xem sân bay có tồn tại không
        SanBay sanBay = sanBayRepository.findById(maSanBay)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sân bay với mã: " + maSanBay));

        // Kiểm tra xem sân bay có đang được sử dụng trong các chuyến bay từ hiện tại đến tương lai không
        LocalDate currentDate = LocalDate.now();
        boolean isInFutureFlights = chiTietChuyenBayRepository.existsByAirportInFutureFlights(maSanBay, currentDate);

        if (isInFutureFlights) {
            throw new IllegalStateException("Không thể thay đổi trạng thái sân bay vì đang có chuyến bay từ hiện tại hoặc trong tương lai sử dụng sân bay này.");
        }

        // Cập nhật trạng thái
        sanBay.setTrangThaiHoatDong(trangThaiMoi);
        return sanBayRepository.save(sanBay);
    }

    /**
     * Lấy danh sách chuyến bay kèm theo thông tin số ghế trống
     * Yêu cầu: Số ghế trống = Tổng ghế của máy bay - COUNT(ghe_da_dat của chuyến đó)
     * Nếu Số ghế trống <= 0, không hiển thị chuyến bay đó
     */
    public List<ChuyenBayWithSeatsDTO> getChuyenBaysWithSeats(String sanBayDi, String sanBayDen, LocalDate ngayDi) {
        // Lấy danh sách chuyến bay theo tuyến và ngày
        List<ChiTietChuyenBay> chuyenBays = chiTietChuyenBayRepository.findByRouteAndDate(sanBayDi, sanBayDen, ngayDi);
        
        List<ChuyenBayWithSeatsDTO> result = new ArrayList<>();
        
        for (ChiTietChuyenBay chuyenBay : chuyenBays) {
            // Lấy tổng số ghế của máy bay
            long tongSoGhe = chuyenBay.getMayBay() != null ? chuyenBay.getMayBay().getTongSoGhe() : 0;
            
            // Đếm số ghế đã đặt (sử dụng GheDaDatRepository)
            long soGheDaDat = gheDaDatRepository.countByChuyenBay_MaChuyenBay(chuyenBay.getMaChuyenBay());
            
            // Tính số ghế trống
            long soGheTrong = tongSoGhe - soGheDaDat;
            
            // Chỉ thêm chuyến bay còn ghế trống vào kết quả
            if (soGheTrong > 0) {
                result.add(new ChuyenBayWithSeatsDTO(chuyenBay, tongSoGhe, soGheDaDat));
            }
        }
        
        return result;
    }

    /**
     * Lấy danh sách chuyến bay (giữ nguyên để tương thích với code cũ)
     * @deprecated Dùng getChuyenBaysWithSeats() để có thông tin ghế trống
     */
    @Deprecated
    public List<ChiTietChuyenBay> getChuyenBays(String sanBayDi, String sanBayDen, LocalDate ngayDi) {
        return chiTietChuyenBayRepository.findByRouteAndDate(sanBayDi, sanBayDen, ngayDi);
    }
}
