package com.example.j2ee.service;

import com.example.j2ee.dto.maybay.CreateMayBayRequest;
import com.example.j2ee.dto.maybay.UpdateMayBayRequest;
import com.example.j2ee.model.MayBay;
import com.example.j2ee.repository.ChiTietChuyenBayRepository;
import com.example.j2ee.repository.MayBayRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * Service xử lý logic nghiệp vụ cho quản lý máy bay
 */
@Service
public class MayBayService {

    private final MayBayRepository mayBayRepository;
    private final ChiTietChuyenBayRepository chiTietChuyenBayRepository;

    public MayBayService(MayBayRepository mayBayRepository,
                         ChiTietChuyenBayRepository chiTietChuyenBayRepository) {
        this.mayBayRepository = mayBayRepository;
        this.chiTietChuyenBayRepository = chiTietChuyenBayRepository;
    }

    /**
     * Lấy danh sách tất cả máy bay (không bao gồm đã xóa mềm)
     */
    public List<MayBay> getAllMayBay() {
        return mayBayRepository.findAll();
    }

    /**
     * Lấy danh sách máy bay đang hoạt động (Active)
     */
    public List<MayBay> getActiveMayBay() {
        return mayBayRepository.findByTrangThai("Active");
    }

    /**
     * Lấy thông tin máy bay theo ID
     */
    public MayBay getMayBayById(Integer maMayBay) {
        return mayBayRepository.findById(maMayBay)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy máy bay với mã: " + maMayBay));
    }

    /**
     * Tạo máy bay mới
     * Validate: số hiệu không trùng, tổng số ghế > 0
     */
    public MayBay createMayBay(CreateMayBayRequest request) {
        // Kiểm tra số hiệu đã tồn tại chưa
        if (mayBayRepository.existsBySoHieu(request.getSoHieu())) {
            throw new IllegalStateException("Số hiệu máy bay '" + request.getSoHieu() + "' đã tồn tại");
        }

        // Validate tổng số ghế
        if (request.getTongSoGhe() <= 0) {
            throw new IllegalArgumentException("Tổng số ghế phải lớn hơn 0");
        }

        MayBay mayBay = new MayBay();
        mayBay.setTenMayBay(request.getTenMayBay());
        mayBay.setHangMayBay(request.getHangMayBay());
        mayBay.setLoaiMayBay(request.getLoaiMayBay());
        mayBay.setSoHieu(request.getSoHieu());
        mayBay.setTongSoGhe(request.getTongSoGhe());
        mayBay.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : "Active");
        mayBay.setNamKhaiThac(request.getNamKhaiThac());
        mayBay.setDaXoa(false);

        return mayBayRepository.save(mayBay);
    }

    /**
     * Cập nhật thông tin máy bay
     * Validate: số hiệu không trùng với máy bay khác (ngoại trừ máy bay đang cập nhật)
     */
    @Transactional
    public MayBay updateMayBay(Integer maMayBay, UpdateMayBayRequest request) {
        MayBay existingMayBay = getMayBayById(maMayBay);

        // Kiểm tra số hiệu có trùng với máy bay khác không
        if (!existingMayBay.getSoHieu().equals(request.getSoHieu())) {
            if (mayBayRepository.existsBySoHieu(request.getSoHieu())) {
                throw new IllegalStateException("Số hiệu máy bay '" + request.getSoHieu() + "' đã tồn tại");
            }
        }

        // Validate tổng số ghế
        if (request.getTongSoGhe() <= 0) {
            throw new IllegalArgumentException("Tổng số ghế phải lớn hơn 0");
        }

        existingMayBay.setTenMayBay(request.getTenMayBay());
        existingMayBay.setHangMayBay(request.getHangMayBay());
        existingMayBay.setLoaiMayBay(request.getLoaiMayBay());
        existingMayBay.setSoHieu(request.getSoHieu());
        existingMayBay.setTongSoGhe(request.getTongSoGhe());
        if (request.getTrangThai() != null) {
            existingMayBay.setTrangThai(request.getTrangThai());
        }
        existingMayBay.setNamKhaiThac(request.getNamKhaiThac());

        return mayBayRepository.save(existingMayBay);
    }

    /**
     * Xóa mềm máy bay
     * Validate: không được xóa nếu máy bay có chuyến bay trong tương lai
     */
    @Transactional
    public void deleteMayBay(Integer maMayBay) {
        MayBay mayBay = getMayBayById(maMayBay);

        // Kiểm tra xem máy bay có chuyến bay trong tương lai không
        LocalDate currentDate = LocalDate.now();
        boolean hasFutureFlights = chiTietChuyenBayRepository
                .existsByAircraftInFutureFlights(maMayBay, currentDate);

        if (hasFutureFlights) {
            throw new IllegalStateException(
                    "Không thể xóa máy bay này vì đang có chuyến bay trong tương lai sử dụng máy bay này"
            );
        }

        // Thực hiện soft delete (sẽ tự động mangle soHieu nhờ @SQLDelete)
        mayBayRepository.deleteById(maMayBay);
    }

    /**
     * Cập nhật trạng thái máy bay
     * Validate: không được thay đổi trạng thái nếu máy bay có chuyến bay trong tương lai
     */
    @Transactional
    public MayBay updateTrangThaiMayBay(Integer maMayBay, String trangThaiMoi) {
        MayBay mayBay = getMayBayById(maMayBay);

        // Kiểm tra xem máy bay có chuyến bay trong tương lai không
        LocalDate currentDate = LocalDate.now();
        boolean hasFutureFlights = chiTietChuyenBayRepository
                .existsByAircraftInFutureFlights(maMayBay, currentDate);

        if (hasFutureFlights) {
            throw new IllegalStateException(
                    "Không thể thay đổi trạng thái máy bay vì đang có chuyến bay trong tương lai sử dụng máy bay này"
            );
        }

        mayBay.setTrangThai(trangThaiMoi);
        return mayBayRepository.save(mayBay);
    }

    /**
     * Khôi phục máy bay đã xóa mềm
     */
    @Transactional
    public MayBay restoreMayBay(Integer maMayBay) {
        // Kiểm tra xem máy bay đã xóa có tồn tại không
        if (!mayBayRepository.findDeletedById(maMayBay).isPresent()) {
            throw new EntityNotFoundException("Không tìm thấy máy bay đã xóa với mã: " + maMayBay);
        }

        // Khôi phục máy bay
        mayBayRepository.restoreById(maMayBay);

        // Trả về máy bay đã khôi phục
        return getMayBayById(maMayBay);
    }

    /**
     * Lấy danh sách máy bay đã xóa mềm
     */
    public List<MayBay> getDeletedMayBay() {
        return mayBayRepository.findAllDeleted();
    }
}
