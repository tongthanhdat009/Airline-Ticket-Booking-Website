package com.example.j2ee.service;

import com.example.j2ee.dto.khuyenmai.ApplyCouponRequest;
import com.example.j2ee.dto.khuyenmai.ApplyCouponResponse;
import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.KhuyenMai;
import com.example.j2ee.model.KhuyenMaiDatCho;
import com.example.j2ee.model.KhuyenMaiDatChoId;
import com.example.j2ee.repository.DatChoRepository;
import com.example.j2ee.repository.KhuyenMaiRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service xử lý khuyến mãi với:
 * 1. Transaction và Lock để chống Race Condition
 * 2. Proration - chia tiền cho từng vé
 * 3. Pipeline validate đầy đủ
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KhuyenMaiService {

    private final KhuyenMaiRepository khuyenMaiRepository;
    private final DatChoRepository datChoRepository;

    /**
     * Áp dụng mã khuyến mãi cho đơn hàng
     * CHỐNG RACE CONDITION: Dùng Lock để đảm bảo chỉ 1 người áp dụng được cùng lúc
     * PRORATION: Tự động chia giảm giá cho từng vé
     */
    @Transactional
    public ApplyCouponResponse applyCoupon(ApplyCouponRequest request) {
        // Pipeline Validate - Bước 1: Validate cơ bản
        if (request.getMaKM() == null || request.getMaKM().trim().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập mã khuyến mãi");
        }

        if (request.getDanhSachMaDatCho() == null || request.getDanhSachMaDatCho().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn ít nhất 1 vé để áp dụng khuyến mãi");
        }

        // Lấy mã khuyến mãi với LOCK để chống Race Condition
        // Khi 100 người bấm "Áp dụng" cùng lúc, chỉ 1 người có thể tiếp tục
        KhuyenMai khuyenMai = khuyenMaiRepository.findByMaKM(request.getMaKM().trim())
                .orElseThrow(() -> new IllegalArgumentException("Mã khuyến mãi không tồn tại"));

        // Pipeline Validate - Bước 2: Kiểm tra hiệu lực
        validateCouponEffectiveness(khuyenMai);

        // Pipeline Validate - Bước 3: Kiểm tra lượt dùng
        validateCouponQuota(khuyenMai, request.getDanhSachMaDatCho().size());

        // Lấy danh sách đặt chỗ
        List<DatCho> danhSachDatCho = datChoRepository.findAllById(request.getDanhSachMaDatCho());
        if (danhSachDatCho.size() != request.getDanhSachMaDatCho().size()) {
            throw new IllegalArgumentException("Một hoặc nhiều vé không tồn tại");
        }

        // Tính tổng giá đơn hàng
        BigDecimal tongGiaDonHang = tinhTongGiaDonHang(danhSachDatCho);

        // Pipeline Validate - Bước 4: Kiểm tra giá trị tối thiểu
        validateMinimumOrderValue(khuyenMai, tongGiaDonHang);

        // Tính toán giảm giá
        BigDecimal giaTriGiam = tinhGiaTriGiam(khuyenMai, tongGiaDonHang);

        // Pipeline Validate - Bước 5: Kiểm tra giá trị tối đa
        validateMaximumDiscount(khuyenMai, giaTriGiam);

        // PRORATION: Chia giảm giá cho từng vé
        // Quan trọng để khi hoàn tiền, biết chính xác mỗi vé được giảm bao nhiêu
        Map<Integer, BigDecimal> phanBoGiamGiaTheoVe = phanBoGiamGia(danhSachDatCho, giaTriGiam);

        // Lưu khuyến mãi cho từng đặt chỗ
        for (DatCho datCho : danhSachDatCho) {
            saveKhuyenMaiDatCho(datCho, khuyenMai, phanBoGiamGiaTheoVe.get(datCho.getMaDatCho()));
        }

        // Cập nhật số lượt đã dùng
        khuyenMai.setSoLuongDaDuocDung(khuyenMai.getSoLuongDaDuocDung() + request.getDanhSachMaDatCho().size());
        khuyenMaiRepository.save(khuyenMai);

        log.info("Áp dụng mã khuyến mãi {} thành công cho {} vé, giảm giá: {}", 
                khuyenMai.getMaKM(), request.getDanhSachMaDatCho().size(), giaTriGiam);

        // Trả về response
        ApplyCouponResponse response = new ApplyCouponResponse();
        response.setMaKhuyenMai(khuyenMai.getMaKhuyenMai());
        response.setTenKhuyenMai(khuyenMai.getTenKhuyenMai());
        response.setTongGiaTruocKM(tongGiaDonHang);
        response.setTongGiaSauKM(tongGiaDonHang.subtract(giaTriGiam));
        response.setGiaTriGiam(giaTriGiam);
        response.setPhanBoTheoVe(phanBoGiamGiaTheoVe);

        return response;
    }

    /**
     * Validate mã khuyến mãi còn hiệu lực không
     */
    private void validateCouponEffectiveness(KhuyenMai khuyenMai) {
        // Kiểm tra trạng thái
        if (!"ACTIVE".equals(khuyenMai.getTrangThai())) {
            throw new IllegalArgumentException("Mã khuyến mãi đã hết hiệu lực hoặc không còn hoạt động");
        }

        // Kiểm tra thời gian
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(khuyenMai.getNgayBatDau())) {
            throw new IllegalArgumentException("Mã khuyến mãi chưa đến thời gian áp dụng");
        }

        if (now.isAfter(khuyenMai.getNgayKetThuc())) {
            throw new IllegalArgumentException("Mã khuyến mãi đã hết hạn sử dụng");
        }
    }

    /**
     * Validate mã khuyến mãi còn lượt dùng không
     */
    private void validateCouponQuota(KhuyenMai khuyenMai, int soLuongVe) {
        if (khuyenMai.getSoLuong() != null) {
            if (khuyenMai.getSoLuongDaDuocDung() >= khuyenMai.getSoLuong()) {
                throw new IllegalArgumentException("Mã khuyến mãi đã hết lượt sử dụng");
            }

            if (khuyenMai.getSoLuongDaDuocDung() + soLuongVe > khuyenMai.getSoLuong()) {
                int conLai = khuyenMai.getSoLuong() - khuyenMai.getSoLuongDaDuocDung();
                throw new IllegalArgumentException("Mã khuyến mãi chỉ còn " + conLai + " lượt sử dụng");
            }
        }
    }

    /**
     * Validate tổng giá đơn hàng đạt mức tối thiểu không
     */
    private void validateMinimumOrderValue(KhuyenMai khuyenMai, BigDecimal tongGiaDonHang) {
        if (khuyenMai.getGiaTriToiThieu() != null && tongGiaDonHang.compareTo(khuyenMai.getGiaTriToiThieu()) < 0) {
            throw new IllegalArgumentException("Đơn hàng phải có giá trị tối thiểu là " + 
                    khuyenMai.getGiaTriToiThieu() + " VNĐ để áp dụng mã này");
        }
    }

    /**
     * Validate mức giảm giá không vượt quá tối đa
     */
    private void validateMaximumDiscount(KhuyenMai khuyenMai, BigDecimal giaTriGiam) {
        if (khuyenMai.getGiaTriToiDa() != null && giaTriGiam.compareTo(khuyenMai.getGiaTriToiDa()) > 0) {
            // Giới hạn mức giảm tối đa
            // (Đây là logic bổ sung, giaTriGiam đã được giới hạn trong tinhGiaTriGiam)
        }
    }

    /**
     * Tính tổng giá đơn hàng
     */
    private BigDecimal tinhTongGiaDonHang(List<DatCho> danhSachDatCho) {
        return danhSachDatCho.stream()
                .map(DatCho::getGiaVe)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Tính giá trị giảm giá theo loại khuyến mãi
     */
    private BigDecimal tinhGiaTriGiam(KhuyenMai khuyenMai, BigDecimal tongGiaDonHang) {
        BigDecimal giaTriGiam;

        if ("PERCENT".equals(khuyenMai.getLoaiKhuyenMai())) {
            // Giảm theo phần trăm
            giaTriGiam = tongGiaDonHang.multiply(khuyenMai.getGiaTriGiam())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            // Giảm theo số tiền cố định
            giaTriGiam = khuyenMai.getGiaTriGiam();
        }

        // Giới hạn mức giảm tối đa
        if (khuyenMai.getGiaTriToiDa() != null && giaTriGiam.compareTo(khuyenMai.getGiaTriToiDa()) > 0) {
            giaTriGiam = khuyenMai.getGiaTriToiDa();
        }

        // Giới hạn không giảm nhiều hơn tổng đơn hàng
        if (giaTriGiam.compareTo(tongGiaDonHang) > 0) {
            giaTriGiam = tongGiaDonHang;
        }

        return giaTriGiam;
    }

    /**
     * PRORATION: Chia giảm giá cho từng vé
     * Quan trọng để khi hoàn tiền, biết chính xác mỗi vé được giảm bao nhiêu
     * 
     * Ví dụ: Đơn 100k, mã giảm 10k cho 2 vé (A=70k, B=30k)
     * - Vé A được giảm: 70/100 * 10 = 7k
     * - Vé B được giảm: 30/100 * 10 = 3k
     */
    private Map<Integer, BigDecimal> phanBoGiamGia(List<DatCho> danhSachDatCho, BigDecimal giaTriGiam) {
        Map<Integer, BigDecimal> phanBo = new HashMap<>();
        BigDecimal tongGiaDonHang = tinhTongGiaDonHang(danhSachDatCho);
        
        for (DatCho datCho : danhSachDatCho) {
            BigDecimal tyLe = datCho.getGiaVe().divide(tongGiaDonHang, 4, RoundingMode.HALF_UP);
            BigDecimal giamGiaChoVe = giaTriGiam.multiply(tyLe).setScale(2, RoundingMode.HALF_UP);
            phanBo.put(datCho.getMaDatCho(), giamGiaChoVe);
        }
        
        // Đảm bảo tổng phân bằng chính xác giaTriGiam (tròn sai số)
        BigDecimal tongPhanBo = phanBo.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        if (tongPhanBo.compareTo(giaTriGiam) != 0) {
            // Thêm sai số cho vé đầu tiên
            int maDatChoDauTien = danhSachDatCho.get(0).getMaDatCho();
            BigDecimal giaHienTai = phanBo.get(maDatChoDauTien);
            phanBo.put(maDatChoDauTien, giaHienTai.add(giaTriGiam.subtract(tongPhanBo)));
        }
        
        return phanBo;
    }

    /**
     * Lưu khuyến mãi cho đặt chỗ
     */
    private void saveKhuyenMaiDatCho(DatCho datCho, KhuyenMai khuyenMai, BigDecimal giaTriGiam) {
        KhuyenMaiDatChoId id = new KhuyenMaiDatChoId();
        id.setMaDatCho(datCho.getMaDatCho());
        id.setMaKhuyenMai(khuyenMai.getMaKhuyenMai());

        KhuyenMaiDatCho khuyenMaiDatCho = new KhuyenMaiDatCho();
        khuyenMaiDatCho.setId(id);
        khuyenMaiDatCho.setKhuyenMai(khuyenMai);
        khuyenMaiDatCho.setDatCho(datCho);
        khuyenMaiDatCho.setSoTienGiam(giaTriGiam);
        khuyenMaiDatCho.setNgaySuDung(LocalDateTime.now());

        datCho.getDanhSachKhuyenMai().add(khuyenMaiDatCho);
    }

    /**
     * Lấy tổng khuyến mãi đã áp dụng cho một đặt chỗ
     */
    public BigDecimal getTongKhuyenMai(int maDatCho) {
        DatCho datCho = datChoRepository.findById(maDatCho)
                .orElseThrow(() -> new IllegalArgumentException("Đặt chỗ không tồn tại"));

        if (datCho.getDanhSachKhuyenMai() == null || datCho.getDanhSachKhuyenMai().isEmpty()) {
            return BigDecimal.ZERO;
        }

        return datCho.getDanhSachKhuyenMai().stream()
                .map(KhuyenMaiDatCho::getSoTienGiam)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
