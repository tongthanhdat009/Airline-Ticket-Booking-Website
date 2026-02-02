package com.example.j2ee.service;

import com.example.j2ee.annotation.Auditable;
import com.example.j2ee.dto.datcho.DoiChuyenBayRequest;
import com.example.j2ee.dto.datcho.DoiGheRequest;
import com.example.j2ee.dto.datcho.DoiHangVeRequest;
import com.example.j2ee.dto.datcho.DoiHangVeResponse;
import com.example.j2ee.dto.datcho.DatChoAdminResponse;
import com.example.j2ee.dto.datcho.DatChoFilterRequest;
import com.example.j2ee.model.ChiTietChuyenBay;
import com.example.j2ee.model.ChiTietGhe;
import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.GheDaDat;
import com.example.j2ee.model.GiaChuyenBay;
import com.example.j2ee.model.HangVe;
import com.example.j2ee.model.HanhKhach;
import com.example.j2ee.repository.ChiTietChuyenBayRepository;
import com.example.j2ee.repository.ChiTietGheRepository;
import com.example.j2ee.repository.DatChoRepository;
import com.example.j2ee.repository.GheDaDatRepository;
import com.example.j2ee.repository.GiaChuyenBayRepository;
import com.example.j2ee.repository.HangVeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service quản lý đặt chỗ cho admin
 * Cung cấp chức năng: xem danh sách, đổi ghế, đổi chuyến bay, check-in
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class QuanLyDatChoService {

    private final DatChoRepository datChoRepository;
    private final GheDaDatRepository gheDaDatRepository;
    private final ChiTietGheRepository chiTietGheRepository;
    private final ChiTietChuyenBayRepository chiTietChuyenBayRepository;
    private final GiaChuyenBayRepository giaChuyenBayRepository;
    private final HangVeRepository hangVeRepository;
    private final EmailService emailService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Kiểm tra trạng thái chuyến bay có cho phép đổi ghế/chuyến không
     */
    private void validateFlightStatusForModification(ChiTietChuyenBay chuyenBay) {
        String trangThai = chuyenBay.getTrangThai();
        if ("Đã bay".equals(trangThai)) {
            throw new IllegalStateException("Không thể thay đổi vì chuyến bay đã bay");
        }
        if ("Đang bay".equals(trangThai)) {
            throw new IllegalStateException("Không thể thay đổi vì chuyến bay đang bay");
        }
        if ("Hủy".equals(trangThai) || "Đã hủy".equals(trangThai)) {
            throw new IllegalStateException("Không thể thay đổi vì chuyến bay đã bị hủy");
        }
    }

    /**
     * Lấy danh sách đặt chỗ với filter và phân trang
     */
    public Page<DatChoAdminResponse> getAllDatCho(DatChoFilterRequest filters, Pageable pageable) {
        // Lấy tất cả đặt chỗ
        List<DatCho> allDatCho = datChoRepository.findAll();
        
        // Filter theo điều kiện
        List<DatCho> filtered = allDatCho.stream()
            .filter(dc -> filters.getMaChuyenBay() == null || 
                    dc.getChuyenBay().getMaChuyenBay() == filters.getMaChuyenBay())
            .filter(dc -> filters.getTrangThai() == null || 
                    filters.getTrangThai().equals(dc.getTrangThai()))
            .filter(dc -> filters.getTuNgay() == null || 
                    !dc.getNgayDatCho().toLocalDate().isBefore(filters.getTuNgay()))
            .filter(dc -> filters.getDenNgay() == null || 
                    !dc.getNgayDatCho().toLocalDate().isAfter(filters.getDenNgay()))
            .filter(dc -> filters.getSearch() == null || filters.getSearch().trim().isEmpty() ||
                    String.valueOf(dc.getMaDatCho()).contains(filters.getSearch()) ||
                    dc.getHanhKhach().getHoVaTen().toLowerCase().contains(filters.getSearch().toLowerCase()) ||
                    dc.getHanhKhach().getMaDinhDanh().contains(filters.getSearch()))
            .collect(Collectors.toList());
        
        // Phân trang thủ công
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filtered.size());
        List<DatChoAdminResponse> pagedList = filtered.subList(start, end).stream()
            .map(this::mapToAdminResponse)
            .collect(Collectors.toList());
        
        return new PageImpl<>(pagedList, pageable, filtered.size());
    }

    /**
     * Lấy chi tiết đặt chỗ theo ID
     */
    public DatChoAdminResponse getDatChoById(int maDatCho) {
        DatCho datCho = datChoRepository.findById(maDatCho)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đặt chỗ với mã: " + maDatCho));
        return mapToAdminResponse(datCho);
    }

    /**
     * Đổi ghế cho đặt chỗ
     * - Cập nhật bảng ghe_da_dat (xóa ghế cũ, thêm ghế mới)
     * - Cập nhật datcho.maghe_da_chon
     * - Gửi email thông báo
     */
    @Auditable(action = "ĐỔI_GHẾ", table = "datcho", paramName = "maDatCho",
               description = "Đổi ghế cho đặt chỗ")
    @Transactional
    public DatChoAdminResponse doiGhe(int maDatCho, DoiGheRequest request) {
        DatCho datCho = datChoRepository.findById(maDatCho)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đặt chỗ với mã: " + maDatCho));
        
        // Kiểm tra trạng thái chuyến bay
        validateFlightStatusForModification(datCho.getChuyenBay());
        
        // Lưu thông tin ghế cũ để gửi email
        ChiTietGhe gheCu = datCho.getChiTietGhe();
        String soGheCu = gheCu != null ? gheCu.getSoGhe() : "N/A";
        
        // Lấy ghế mới
        ChiTietGhe gheMoi = chiTietGheRepository.findById(request.getMaGheMoi())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ghế mới với mã: " + request.getMaGheMoi()));
        
        // Kiểm tra ghế mới đã được đặt chưa (loại trừ chính đặt chỗ hiện tại)
        int maChuyenBay = datCho.getChuyenBay().getMaChuyenBay();
        List<GheDaDat> existingBookings = gheDaDatRepository.findByChuyenBay_MaChuyenBay(maChuyenBay);
        boolean isSeatTaken = existingBookings.stream()
            .anyMatch(gdd -> gdd.getGhe().getMaGhe() == request.getMaGheMoi() 
                && gdd.getDatCho().getMaDatCho() != maDatCho
                && !"CANCELLED".equals(gdd.getDatCho().getTrangThai()));
        
        if (isSeatTaken) {
            throw new IllegalStateException("Ghế " + gheMoi.getSoGhe() + " đã được đặt bởi hành khách khác");
        }
        
        // Xóa ghế cũ trong bảng ghe_da_dat
        if (gheCu != null) {
            log.debug("Xóa ghế cũ {} khỏi chuyến bay {}", gheCu.getMaGhe(), maChuyenBay);
            gheDaDatRepository.deleteByChuyenBay_MaChuyenBayAndGhe_MaGhe(maChuyenBay, gheCu.getMaGhe());
        }
        
        // Tạo ghế đã đặt mới
        GheDaDat gheDaDatMoi = new GheDaDat();
        gheDaDatMoi.setChuyenBay(datCho.getChuyenBay());
        gheDaDatMoi.setGhe(gheMoi);
        gheDaDatMoi.setDatCho(datCho);
        gheDaDatMoi.setThoiGianDat(LocalDateTime.now());
        gheDaDatRepository.save(gheDaDatMoi);
        
        // Cập nhật ghế mới cho đặt chỗ
        datCho.setChiTietGhe(gheMoi);
        datChoRepository.save(datCho);
        
        // Gửi email thông báo
        try {
            sendDoiGheEmail(datCho, soGheCu, gheMoi.getSoGhe(), request.getLyDo());
        } catch (Exception e) {
            log.warn("Không thể gửi email thông báo đổi ghế: {}", e.getMessage());
        }
        
        log.info("Đã đổi ghế cho đặt chỗ {}: {} -> {}", maDatCho, soGheCu, gheMoi.getSoGhe());
        return mapToAdminResponse(datCho);
    }

    /**
     * Đổi chuyến bay cho đặt chỗ
     * - Validate không được đổi nếu đã check-in
     * - Cập nhật chuyến bay mới và ghế mới
     * - Gửi email thông báo
     */
    @Auditable(action = "ĐỔI_CHUYẾN_BAY", table = "datcho", paramName = "maDatCho",
               description = "Đổi chuyến bay cho đặt chỗ")
    @Transactional
    public DatChoAdminResponse doiChuyenBay(int maDatCho, DoiChuyenBayRequest request) {
        DatCho datCho = datChoRepository.findById(maDatCho)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đặt chỗ với mã: " + maDatCho));
        
        // Validate: Không thể đổi chuyến bay khi đã check-in
        if (datCho.isCheckInStatus()) {
            throw new IllegalStateException("Không thể đổi chuyến bay khi đã check-in");
        }
        
        // Lưu thông tin chuyến bay cũ để gửi email
        ChiTietChuyenBay chuyenBayCu = datCho.getChuyenBay();
        String soHieuCu = chuyenBayCu.getSoHieuChuyenBay();
        
        // Lấy chuyến bay mới
        ChiTietChuyenBay chuyenBayMoi = chiTietChuyenBayRepository.findById(request.getMaChuyenBayMoi())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chuyến bay mới với mã: " + request.getMaChuyenBayMoi()));
        
        // Kiểm tra trạng thái chuyến bay cũ và mới
        validateFlightStatusForModification(chuyenBayCu);
        validateFlightStatusForModification(chuyenBayMoi);
        
        // Lấy ghế mới
        ChiTietGhe gheMoi = chiTietGheRepository.findById(request.getMaGheMoi())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ghế mới với mã: " + request.getMaGheMoi()));
        
        // Kiểm tra ghế mới đã được đặt chưa (loại trừ chính đặt chỗ hiện tại)
        List<GheDaDat> existingBookingsNewFlight = gheDaDatRepository.findByChuyenBay_MaChuyenBay(request.getMaChuyenBayMoi());
        boolean isSeatTakenNewFlight = existingBookingsNewFlight.stream()
            .anyMatch(gdd -> gdd.getGhe().getMaGhe() == request.getMaGheMoi() 
                && gdd.getDatCho().getMaDatCho() != maDatCho
                && !"CANCELLED".equals(gdd.getDatCho().getTrangThai()));
        
        if (isSeatTakenNewFlight) {
            throw new IllegalStateException("Ghế " + gheMoi.getSoGhe() + " đã được đặt bởi hành khách khác");
        }
        
        // Xóa ghế cũ trong bảng ghe_da_dat
        ChiTietGhe gheCu = datCho.getChiTietGhe();
        if (gheCu != null) {
            log.debug("Xóa ghế cũ {} khỏi chuyến bay cũ {}", gheCu.getMaGhe(), chuyenBayCu.getMaChuyenBay());
            gheDaDatRepository.deleteByChuyenBay_MaChuyenBayAndGhe_MaGhe(
                chuyenBayCu.getMaChuyenBay(), gheCu.getMaGhe());
        }
        
        // Tạo ghế đã đặt mới
        GheDaDat gheDaDatMoi = new GheDaDat();
        gheDaDatMoi.setChuyenBay(chuyenBayMoi);
        gheDaDatMoi.setGhe(gheMoi);
        gheDaDatMoi.setDatCho(datCho);
        gheDaDatMoi.setThoiGianDat(LocalDateTime.now());
        gheDaDatRepository.save(gheDaDatMoi);
        
        // Cập nhật chuyến bay và ghế mới cho đặt chỗ
        datCho.setChuyenBay(chuyenBayMoi);
        datCho.setChiTietGhe(gheMoi);
        datChoRepository.save(datCho);
        
        // Gửi email thông báo
        try {
            sendDoiChuyenBayEmail(datCho, chuyenBayCu, chuyenBayMoi, request.getLyDo());
        } catch (Exception e) {
            log.warn("Không thể gửi email thông báo đổi chuyến bay: {}", e.getMessage());
        }
        
        log.info("Đã đổi chuyến bay cho đặt chỗ {}: {} -> {}", maDatCho, soHieuCu, chuyenBayMoi.getSoHieuChuyenBay());
        return mapToAdminResponse(datCho);
    }

    /**
     * Admin check-in cho hành khách
     */
    @Auditable(action = "ADMIN_CHECK_IN", table = "datcho", paramName = "maDatCho",
               description = "Admin thực hiện check-in cho hành khách")
    @Transactional
    public DatChoAdminResponse adminCheckIn(int maDatCho) {
        DatCho datCho = datChoRepository.findById(maDatCho)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đặt chỗ với mã: " + maDatCho));
        
        // Kiểm tra đã check-in chưa
        if (datCho.isCheckInStatus()) {
            throw new IllegalStateException("Hành khách đã check-in trước đó");
        }
        
        // Thực hiện check-in
        datCho.setCheckInStatus(true);
        datCho.setCheckInTime(LocalDateTime.now());
        datChoRepository.save(datCho);
        
        // Gửi WebSocket message để cập nhật real-time
        try {
            CheckInEvent event = new CheckInEvent(
                datCho.getMaDatCho(),
                datCho.getHanhKhach() != null ? datCho.getHanhKhach().getMaHanhKhach() : null,
                datCho.getChuyenBay() != null ? datCho.getChuyenBay().getMaChuyenBay() : null,
                LocalDateTime.now()
            );
            messagingTemplate.convertAndSend("/topic/checkin-updates", event);
            log.debug("Sent WebSocket check-in update for booking {}", maDatCho);
        } catch (Exception e) {
            log.warn("Failed to send WebSocket message: {}", e.getMessage());
        }
        
        log.info("Admin đã check-in cho đặt chỗ {}", maDatCho);
        return mapToAdminResponse(datCho);
    }

    /**
     * Event class for WebSocket check-in notifications
     */
    public record CheckInEvent(
        int maDatCho,
        Integer maHanhKhach,
        Integer maChuyenBay,
        LocalDateTime checkInTime
    ) {}

    /**
     * Hủy đặt chỗ (admin)
     */
    @Auditable(action = "HỦY_VÉ", table = "datcho", paramName = "maDatCho",
               description = "Admin hủy đặt chỗ")
    @Transactional
    public void huyDatCho(int maDatCho, String lyDo) {
        DatCho datCho = datChoRepository.findById(maDatCho)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đặt chỗ với mã: " + maDatCho));
        
        // Kiểm tra đã check-in chưa
        if (datCho.isCheckInStatus()) {
            throw new IllegalStateException("Không thể hủy vé đã check-in");
        }
        
        // Giải phóng ghế
        ChiTietGhe ghe = datCho.getChiTietGhe();
        if (ghe != null) {
            gheDaDatRepository.deleteByChuyenBay_MaChuyenBayAndGhe_MaGhe(
                datCho.getChuyenBay().getMaChuyenBay(), ghe.getMaGhe());
        }
        
        // Cập nhật trạng thái
        datCho.setTrangThai("CANCELLED");
        datCho.setChiTietGhe(null);
        datChoRepository.save(datCho);
        
        log.info("Admin đã hủy đặt chỗ {} - Lý do: {}", maDatCho, lyDo);
    }

    /**
     * Mapping từ DatCho entity sang DatChoAdminResponse
     */
    private DatChoAdminResponse mapToAdminResponse(DatCho datCho) {
        DatChoAdminResponse response = new DatChoAdminResponse();
        
        // Thông tin đặt chỗ
        response.setMaDatCho(datCho.getMaDatCho());
        response.setNgayDatCho(datCho.getNgayDatCho());
        response.setTrangThai(datCho.getTrangThai());
        response.setGiaVe(datCho.getGiaVe());
        response.setCheckInStatus(datCho.isCheckInStatus());
        response.setCheckInTime(datCho.getCheckInTime());
        
        // Thông tin hành khách
        HanhKhach hk = datCho.getHanhKhach();
        if (hk != null) {
            response.setMaHanhKhach(hk.getMaHanhKhach());
            response.setHoVaTen(hk.getHoVaTen());
            response.setCccd(hk.getMaDinhDanh());
            response.setGioiTinh(hk.getGioiTinh());
            response.setNgaySinh(hk.getNgaySinh() != null ? hk.getNgaySinh().toString() : null);
            response.setSoDienThoai(hk.getSoDienThoai());
            response.setEmail(hk.getEmail());
        }
        
        // Thông tin chuyến bay
        ChiTietChuyenBay cb = datCho.getChuyenBay();
        if (cb != null) {
            response.setMaChuyenBay(cb.getMaChuyenBay());
            response.setSoHieuChuyenBay(cb.getSoHieuChuyenBay());
            response.setTrangThaiChuyenBay(cb.getTrangThai());
            if (cb.getTuyenBay() != null) {
                if (cb.getTuyenBay().getSanBayDi() != null) {
                    response.setSanBayDi(cb.getTuyenBay().getSanBayDi().getTenSanBay());
                    response.setMaSanBayDi(cb.getTuyenBay().getSanBayDi().getMaIATA());
                }
                if (cb.getTuyenBay().getSanBayDen() != null) {
                    response.setSanBayDen(cb.getTuyenBay().getSanBayDen().getTenSanBay());
                    response.setMaSanBayDen(cb.getTuyenBay().getSanBayDen().getMaIATA());
                }
            }
            response.setNgayGioDi(cb.getNgayDi() != null && cb.getGioDi() != null ? 
                cb.getNgayDi().atTime(cb.getGioDi()) : null);
            response.setNgayGioDen(cb.getNgayDen() != null && cb.getGioDen() != null ? 
                cb.getNgayDen().atTime(cb.getGioDen()) : null);
        }
        
        // Thông tin ghế
        ChiTietGhe ghe = datCho.getChiTietGhe();
        if (ghe != null) {
            response.setMaGhe(ghe.getMaGhe());
            response.setSoGhe(ghe.getSoGhe());
            // Loại ghế lấy từ vị trí ghế
            String loaiGhe = ghe.getViTriGhe() != null ? ghe.getViTriGhe() : "Thường";
            response.setLoaiGhe(loaiGhe);
            // Hạng ghế lấy từ số hàng
            response.setHangGhe(ghe.getHang() != null ? String.valueOf(ghe.getHang()) : null);
        }
        
        // Thông tin hạng vé
        if (datCho.getHangVe() != null) {
            response.setTenHangVe(datCho.getHangVe().getTenHangVe());
        }
        
        // Thông tin đơn hàng
        if (datCho.getDonHang() != null) {
            response.setMaDonHang(datCho.getDonHang().getMaDonHang());
            response.setPnr(datCho.getDonHang().getPnr());
        }
        
        // Thông tin thanh toán
        if (datCho.getTrangThaiThanhToan() != null) {
            char daThanhToan = datCho.getTrangThaiThanhToan().getDaThanhToan();
            response.setTrangThaiThanhToan(daThanhToan == 'Y' ? "Đã thanh toán" : 
                                          daThanhToan == 'N' ? "Chưa thanh toán" : "Đã hủy");
            response.setSoTienDaThanhToan(datCho.getTrangThaiThanhToan().getSoTien());
        }
        
        return response;
    }

    /**
     * Gửi email thông báo đổi ghế
     */
    private void sendDoiGheEmail(DatCho datCho, String gheCu, String gheMoi, String lyDo) {
        if (datCho.getHanhKhach() == null || datCho.getHanhKhach().getEmail() == null) {
            return;
        }
        
        String email = datCho.getHanhKhach().getEmail();
        String tenHanhKhach = datCho.getHanhKhach().getHoVaTen();
        String pnr = datCho.getDonHang() != null ? datCho.getDonHang().getPnr() : "N/A";
        String soHieuChuyenBay = datCho.getChuyenBay() != null ? 
            datCho.getChuyenBay().getSoHieuChuyenBay() : "N/A";
        
        emailService.sendDoiGheNotification(email, tenHanhKhach, pnr, gheCu, gheMoi, soHieuChuyenBay, lyDo);
    }

    /**
     * Gửi email thông báo đổi chuyến bay
     */
    private void sendDoiChuyenBayEmail(DatCho datCho, ChiTietChuyenBay cbCu, ChiTietChuyenBay cbMoi, String lyDo) {
        if (datCho.getHanhKhach() == null || datCho.getHanhKhach().getEmail() == null) {
            return;
        }
        
        String email = datCho.getHanhKhach().getEmail();
        String tenHanhKhach = datCho.getHanhKhach().getHoVaTen();
        String pnr = datCho.getDonHang() != null ? datCho.getDonHang().getPnr() : "N/A";
        
        emailService.sendDoiChuyenBayNotification(email, tenHanhKhach, pnr, cbCu, cbMoi, lyDo);
    }

    // ==================== DOI HANG VE ====================
    
    /**
     * Tinh toan phi doi hang ve
     * - Nang hang (thap -> cao): Khach tra them tien chenh lech
     * - Ha hang (cao -> thap): Phat 20% gia chenh lech
     */
    public DoiHangVeResponse tinhPhiDoiHangVe(int maDatCho, Integer maHangVeMoi) {
        DatCho datCho = datChoRepository.findById(maDatCho)
            .orElseThrow(() -> new IllegalArgumentException("Khong tim thay dat cho"));
        
        HangVe hangVeCu = datCho.getHangVe();
        HangVe hangVeMoi = hangVeRepository.findById(maHangVeMoi)
            .orElseThrow(() -> new IllegalArgumentException("Khong tim thay hang ve moi"));
        
        BigDecimal giaVeCu = datCho.getGiaVe();
        
        ChiTietChuyenBay chuyenBay = datCho.getChuyenBay();
        GiaChuyenBay giaChuyenBayMoi = giaChuyenBayRepository
            .findByTuyenBay_MaTuyenBayAndHangVe_MaHangVe(
                chuyenBay.getTuyenBay().getMaTuyenBay(), 
                maHangVeMoi
            );
        
        if (giaChuyenBayMoi == null) {
            throw new IllegalStateException("Khong tim thay gia ve cho hang ve nay");
        }
        
        BigDecimal giaVeMoi = giaChuyenBayMoi.getGiaVe();
        BigDecimal chenhLech = giaVeMoi.subtract(giaVeCu);
        BigDecimal phiDoi = BigDecimal.ZERO;
        String loaiGiaoDich;
        
        final BigDecimal PHAN_TRAM_PHI = new BigDecimal("0.20");
        
        if (chenhLech.compareTo(BigDecimal.ZERO) > 0) {
            loaiGiaoDich = "THU_THEM";
        } else if (chenhLech.compareTo(BigDecimal.ZERO) < 0) {
            loaiGiaoDich = "HOAN_TIEN";
            phiDoi = chenhLech.abs().multiply(PHAN_TRAM_PHI);
            chenhLech = chenhLech.abs();
        } else {
            loaiGiaoDich = "KHONG_DOI";
        }
        
        BigDecimal tongThanhToan = chenhLech.add(phiDoi);
        
        DoiHangVeResponse response = new DoiHangVeResponse();
        response.setMaDatCho(maDatCho);
        response.setTenHangVeCu(hangVeCu.getTenHangVe());
        response.setTenHangVeMoi(hangVeMoi.getTenHangVe());
        response.setGiaVeCu(giaVeCu);
        response.setGiaVeMoi(giaVeMoi);
        response.setChenhLech(chenhLech);
        response.setPhiDoi(phiDoi);
        response.setTongThanhToan(tongThanhToan);
        response.setLoaiGiaoDich(loaiGiaoDich);
        response.setSoHieuChuyenBay(chuyenBay.getSoHieuChuyenBay());
        
        return response;
    }
    
    /**
     * Thuc hien doi hang ve
     */
    @Auditable(action = "DOI_HANG_VE", table = "datcho", paramName = "maDatCho",
               description = "Doi hang ve cho dat cho")
    @Transactional
    public DoiHangVeResponse doiHangVe(int maDatCho, DoiHangVeRequest request) {
        DatCho datCho = datChoRepository.findById(maDatCho)
            .orElseThrow(() -> new IllegalArgumentException("Khong tim thay dat cho"));
        
        validateFlightStatusForModification(datCho.getChuyenBay());
        
        if (datCho.isCheckInStatus()) {
            throw new IllegalStateException("Khong the doi hang ve khi da check-in");
        }
        
        // Tinh phi truoc khi thuc hien
        DoiHangVeResponse response = tinhPhiDoiHangVe(maDatCho, request.getMaHangVeMoi());
        
        HangVe hangVeMoi = hangVeRepository.findById(request.getMaHangVeMoi())
            .orElseThrow(() -> new IllegalArgumentException("Khong tim thay hang ve moi"));
        
        // Lay ghe moi neu co
        ChiTietGhe gheMoi = null;
        if (request.getMaGheMoi() != null) {
            gheMoi = chiTietGheRepository.findById(request.getMaGheMoi())
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay ghe moi"));
            
            // Kiem tra ghe moi co trong hang ve moi khong
            if (gheMoi.getHangVe().getMaHangVe() != request.getMaHangVeMoi()) {
                throw new IllegalStateException("Ghe moi khong thuoc hang ve da chon");
            }
        }
        
        // Cap nhat hang ve va gia ve
        datCho.setHangVe(hangVeMoi);
        datCho.setGiaVe(response.getGiaVeMoi());
        
        // Cap nhat ghe neu co
        if (gheMoi != null) {
            // Xoa ghe cu trong bang ghe_da_dat
            ChiTietGhe gheCu = datCho.getChiTietGhe();
            if (gheCu != null) {
                gheDaDatRepository.deleteByChuyenBay_MaChuyenBayAndGhe_MaGhe(
                    datCho.getChuyenBay().getMaChuyenBay(), gheCu.getMaGhe());
            }
            
            // Tao ghe da dat moi
            GheDaDat gheDaDatMoi = new GheDaDat();
            gheDaDatMoi.setChuyenBay(datCho.getChuyenBay());
            gheDaDatMoi.setGhe(gheMoi);
            gheDaDatMoi.setDatCho(datCho);
            gheDaDatMoi.setThoiGianDat(LocalDateTime.now());
            gheDaDatRepository.save(gheDaDatMoi);
            
            datCho.setChiTietGhe(gheMoi);
            response.setSoGheMoi(gheMoi.getSoGhe());
        }
        
        datChoRepository.save(datCho);
        
        log.info("Da doi hang ve cho dat cho {}: {} -> {}", 
            maDatCho, response.getTenHangVeCu(), response.getTenHangVeMoi());
        
        return response;
    }
}
