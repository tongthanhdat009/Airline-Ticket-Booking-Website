package com.example.j2ee.service;

import com.example.j2ee.dto.hoadon.*;
import com.example.j2ee.model.DonHang;
import com.example.j2ee.model.HoaDon;
import com.example.j2ee.repository.DonHangRepository;
import com.example.j2ee.repository.HoaDonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service quản lý hóa đơn
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HoaDonService {

    private final HoaDonRepository hoaDonRepository;
    private final DonHangRepository donHangRepository;

    /**
     * Lấy danh sách hóa đơn với bộ lọc
     */
    public List<HoaDonResponse> getAllHoaDon(
            String search,
            String trangThai,
            LocalDate tuNgay,
            LocalDate denNgay,
            String sort
    ) {
        Specification<HoaDon> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by trạng thái
            if (trangThai != null && !trangThai.isEmpty()) {
                predicates.add(cb.equal(root.get("trangThai"), trangThai));
            }

            // Filter by date range
            if (tuNgay != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("ngayLap"), tuNgay.atStartOfDay()));
            }
            if (denNgay != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("ngayLap"), denNgay.plusDays(1).atStartOfDay()));
            }

            // Search by multiple fields
            if (search != null && !search.isEmpty()) {
                String searchLower = "%" + search.toLowerCase() + "%";
                Predicate searchPredicate = cb.or(
                    cb.like(cb.lower(root.get("soHoaDon")), searchLower),
                    cb.like(cb.lower(root.get("donHang").get("pnr")), searchLower),
                    cb.like(cb.lower(root.get("donHang").get("emailNguoiDat")), searchLower),
                    cb.like(cb.lower(root.get("donHang").get("hanhKhachNguoiDat").get("hoVaTen")), searchLower)
                );
                predicates.add(searchPredicate);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // Apply sorting
        List<HoaDon> hoaDonList;
        if (sort != null && !sort.isEmpty()) {
            org.springframework.data.domain.Sort sortOption = createSortOption(sort);
            hoaDonList = hoaDonRepository.findAll(spec, sortOption);
        } else {
            hoaDonList = hoaDonRepository.findAll(spec);
        }

        return hoaDonList.stream()
                .map(this::mapToHoaDonResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết hóa đơn theo ID
     */
    public HoaDonDetailResponse getHoaDonById(Integer maHoaDon) {
        HoaDon hoaDon = hoaDonRepository.findById(maHoaDon)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn"));
        return mapToHoaDonDetailResponse(hoaDon);
    }

    /**
     * Lấy hóa đơn theo số hóa đơn
     */
    public HoaDonDetailResponse getHoaDonBySoHoaDon(String soHoaDon) {
        HoaDon hoaDon = hoaDonRepository.findBySoHoaDon(soHoaDon)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn"));
        return mapToHoaDonDetailResponse(hoaDon);
    }

    /**
     * Tạo hóa đơn mới
     */
    @Transactional(rollbackFor = Exception.class)
    public HoaDonResponse createHoaDon(CreateHoaDonRequest request) {
        // Kiểm tra đơn hàng tồn tại
        DonHang donHang = donHangRepository.findById(request.getMaDonHang())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng"));

        // Kiểm tra số hóa đơn đã tồn tại chưa
        if (hoaDonRepository.findBySoHoaDon(request.getSoHoaDon()).isPresent()) {
            throw new IllegalArgumentException("Số hóa đơn đã tồn tại");
        }

        HoaDon hoaDon = new HoaDon();
        hoaDon.setDonHang(donHang);
        hoaDon.setSoHoaDon(request.getSoHoaDon());
        hoaDon.setNgayHachToan(request.getNgayHachToan());
        hoaDon.setTongTien(request.getTongTien());
        hoaDon.setThueVAT(request.getThueVAT() != null ? request.getThueVAT() : BigDecimal.ZERO);
        
        // Tính tổng thanh toán
        BigDecimal tongThanhToan = request.getTongTien().add(hoaDon.getThueVAT());
        hoaDon.setTongThanhToan(tongThanhToan);
        
        hoaDon.setTrangThai("DA_PHAT_HANH");
        hoaDon.setNguoiLap(request.getNguoiLap());
        hoaDon.setGhiChu(request.getGhiChu());

        hoaDonRepository.save(hoaDon);
        log.info("Đã tạo hóa đơn {} cho đơn hàng {}", hoaDon.getSoHoaDon(), donHang.getMaDonHang());

        return mapToHoaDonResponse(hoaDon);
    }

    /**
     * Cập nhật hóa đơn
     */
    @Transactional(rollbackFor = Exception.class)
    public HoaDonResponse updateHoaDon(Integer maHoaDon, UpdateHoaDonRequest request) {
        HoaDon hoaDon = hoaDonRepository.findById(maHoaDon)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn"));

        // Không cho phép cập nhật hóa đơn đã hủy
        if (hoaDon.isDaHuy()) {
            throw new IllegalArgumentException("Không thể cập nhật hóa đơn đã hủy");
        }

        if (request.getNgayHachToan() != null) {
            hoaDon.setNgayHachToan(request.getNgayHachToan());
        }
        if (request.getThueVAT() != null) {
            hoaDon.setThueVAT(request.getThueVAT());
            // Tính lại tổng thanh toán
            hoaDon.setTongThanhToan(hoaDon.getTongTien().add(request.getThueVAT()));
        }
        if (request.getNguoiLap() != null) {
            hoaDon.setNguoiLap(request.getNguoiLap());
        }
        if (request.getGhiChu() != null) {
            hoaDon.setGhiChu(request.getGhiChu());
        }
        if (request.getTrangThai() != null) {
            hoaDon.setTrangThai(request.getTrangThai());
        }

        hoaDonRepository.save(hoaDon);
        log.info("Đã cập nhật hóa đơn {}", maHoaDon);

        return mapToHoaDonResponse(hoaDon);
    }

    /**
     * Hủy hóa đơn
     */
    @Transactional(rollbackFor = Exception.class)
    public HoaDonResponse huyHoaDon(Integer maHoaDon, String lyDoHuy, String nguoiThucHien) {
        HoaDon hoaDon = hoaDonRepository.findById(maHoaDon)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn"));

        if (hoaDon.isDaHuy()) {
            throw new IllegalArgumentException("Hóa đơn đã được hủy trước đó");
        }

        hoaDon.setTrangThai("DA_HUY");
        hoaDon.setGhiChu("Hủy: " + lyDoHuy + " - Ngưởi hủy: " + nguoiThucHien);
        hoaDonRepository.save(hoaDon);

        log.info("Đã hủy hóa đơn {} bởi {}", maHoaDon, nguoiThucHien);
        return mapToHoaDonResponse(hoaDon);
    }

    /**
     * Xóa mềm hóa đơn
     */
    @Transactional(rollbackFor = Exception.class)
    public void softDeleteHoaDon(Integer maHoaDon) {
        HoaDon hoaDon = hoaDonRepository.findById(maHoaDon)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn"));

        if (!hoaDon.isDaHuy()) {
            throw new IllegalArgumentException("Chỉ có thể xóa hóa đơn đã hủy");
        }

        hoaDonRepository.delete(hoaDon);
        log.info("Đã xóa mềm hóa đơn {}", maHoaDon);
    }

    /**
     * Khôi phục hóa đơn đã xóa mềm
     */
    @Transactional(rollbackFor = Exception.class)
    public void restoreHoaDon(Integer maHoaDon) {
        hoaDonRepository.restoreById(maHoaDon);
        log.info("Đã khôi phục hóa đơn {}", maHoaDon);
    }

    /**
     * Lấy thống kê hóa đơn
     */
    public HoaDonThongKeDTO getThongKe() {
        List<HoaDon> allHoaDon = hoaDonRepository.findAll();

        long tongSoHoaDon = allHoaDon.size();
        long daPhatHanh = allHoaDon.stream().filter(HoaDon::isDaPhatHanh).count();
        long daHuy = allHoaDon.stream().filter(HoaDon::isDaHuy).count();
        long dieuChinh = allHoaDon.stream().filter(HoaDon::isDieuChinh).count();

        BigDecimal tongDoanhThu = allHoaDon.stream()
                .filter(HoaDon::isDaPhatHanh)
                .map(HoaDon::getTongTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tongThueVAT = allHoaDon.stream()
                .filter(HoaDon::isDaPhatHanh)
                .map(HoaDon::getThueVAT)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tongThanhToanThucTe = allHoaDon.stream()
                .filter(HoaDon::isDaPhatHanh)
                .map(HoaDon::getTongThanhToan)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return HoaDonThongKeDTO.builder()
                .tongSoHoaDon(tongSoHoaDon)
                .daPhatHanh(daPhatHanh)
                .daHuy(daHuy)
                .dieuChinh(dieuChinh)
                .tongDoanhThu(tongDoanhThu)
                .tongThueVAT(tongThueVAT)
                .tongThanhToanThucTe(tongThanhToanThucTe)
                .build();
    }

    /**
     * Tạo số hóa đơn tự động theo pattern HD{YYYY}{NNNN}
     */
    public String generateSoHoaDon() {
        String year = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy"));
        long count = hoaDonRepository.countHoaDonInCurrentYear();
        String sequence = String.format("%04d", count + 1);
        return "HD" + year + sequence;
    }

    // ==================== MAPPER METHODS ====================

    private HoaDonResponse mapToHoaDonResponse(HoaDon hoaDon) {
        DonHang donHang = hoaDon.getDonHang();

        return HoaDonResponse.builder()
                .maHoaDon(hoaDon.getMaHoaDon())
                .maDonHang(donHang != null ? donHang.getMaDonHang() : null)
                .soHoaDon(hoaDon.getSoHoaDon())
                .pnr(donHang != null ? donHang.getPnr() : null)
                .ngayLap(hoaDon.getNgayLap())
                .ngayHachToan(hoaDon.getNgayHachToan())
                .tongTien(hoaDon.getTongTien())
                .thueVAT(hoaDon.getThueVAT())
                .tongThanhToan(hoaDon.getTongThanhToan())
                .trangThai(hoaDon.getTrangThai())
                .nguoiLap(hoaDon.getNguoiLap())
                .ghiChu(hoaDon.getGhiChu())
                .emailNguoiDat(donHang != null ? donHang.getEmailNguoiDat() : null)
                .soDienThoaiNguoiDat(donHang != null ? donHang.getSoDienThoaiNguoiDat() : null)
                .hoTenNguoiDat(donHang != null && donHang.getHanhKhachNguoiDat() != null 
                    ? donHang.getHanhKhachNguoiDat().getHoVaTen() : null)
                .tongGiaDonHang(donHang != null ? donHang.getTongGia() : null)
                .build();
    }

    private HoaDonDetailResponse mapToHoaDonDetailResponse(HoaDon hoaDon) {
        DonHang donHang = hoaDon.getDonHang();

        return HoaDonDetailResponse.builder()
                .maHoaDon(hoaDon.getMaHoaDon())
                .maDonHang(donHang != null ? donHang.getMaDonHang() : null)
                .soHoaDon(hoaDon.getSoHoaDon())
                .pnr(donHang != null ? donHang.getPnr() : null)
                .ngayLap(hoaDon.getNgayLap())
                .ngayHachToan(hoaDon.getNgayHachToan())
                .tongTien(hoaDon.getTongTien())
                .thueVAT(hoaDon.getThueVAT())
                .tongThanhToan(hoaDon.getTongThanhToan())
                .trangThai(hoaDon.getTrangThai())
                .nguoiLap(hoaDon.getNguoiLap())
                .ghiChu(hoaDon.getGhiChu())
                .createdAt(hoaDon.getCreatedAt())
                .updatedAt(hoaDon.getUpdatedAt())
                .emailNguoiDat(donHang != null ? donHang.getEmailNguoiDat() : null)
                .soDienThoaiNguoiDat(donHang != null ? donHang.getSoDienThoaiNguoiDat() : null)
                .hoTenNguoiDat(donHang != null && donHang.getHanhKhachNguoiDat() != null 
                    ? donHang.getHanhKhachNguoiDat().getHoVaTen() : null)
                .trangThaiDonHang(donHang != null ? donHang.getTrangThai() : null)
                .tongGiaDonHang(donHang != null ? donHang.getTongGia() : null)
                .build();
    }

    /**
     * Tạo sort option từ string
     */
    private org.springframework.data.domain.Sort createSortOption(String sort) {
        String[] parts = sort.split(":");
        String field = parts[0];
        String direction = parts.length > 1 ? parts[1] : "desc";

        org.springframework.data.domain.Sort.Direction dir = 
            "asc".equalsIgnoreCase(direction) 
                ? org.springframework.data.domain.Sort.Direction.ASC 
                : org.springframework.data.domain.Sort.Direction.DESC;

        return org.springframework.data.domain.Sort.by(dir, field);
    }
}
