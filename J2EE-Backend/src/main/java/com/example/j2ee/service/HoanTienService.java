package com.example.j2ee.service;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.hoantien.*;
import com.example.j2ee.model.*;
import com.example.j2ee.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service xử lý hoàn tiền với:
 * 1. Check điều kiện hạng vé (Refund Policy)
 * 2. Tính toán số tiền hoàn thực tế
 * 3. Giải phóng ghế (Inventory Return)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HoanTienService {

    private final DatChoRepository datChoRepository;
    private final TrangThaiThanhToanRepository trangThaiThanhToanRepository;
    private final DatChoDichVuRepository datChoDichVuRepository;
    private final GheDaDatRepository gheDaDatRepository;
    private final GiaChuyenBayRepository giaChuyenBayRepository;
    private final KhuyenMaiService khuyenMaiService;

    /**
     * Yêu cầu hoàn tiền cho một đặt chỗ
     * Kiểm tra điều kiện hạng vé và tính toán tiền hoàn
     */
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<RefundResponse> requestRefund(int maDatCho, String lyDo) {
        // Lấy thông tin đặt chỗ
        DatCho datCho = datChoRepository.findById(maDatCho)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đặt chỗ"));

        // Kiểm tra đã thanh toán chưa
        TrangThaiThanhToan thanhToan = trangThaiThanhToanRepository.findByDatCho_MaDatCho(maDatCho);
        if (thanhToan == null || thanhToan.getDaThanhToan() != 'Y') {
            throw new IllegalArgumentException("Không thể hoàn tiền cho vé chưa thanh toán");
        }

        // Check Refund Policy - Điều kiện hạng vé
        RefundPolicy policy = checkRefundPolicy(datCho);
        if (!policy.isRefundable()) {
            return ApiResponse.error(policy.getMessage());
        }

        // Tính toán số tiền hoàn thực tế
        HoanTienCalculation calculation = calculateRefundAmount(datCho, policy);

        // Tạo response
        RefundResponse response = new RefundResponse();
        response.setMaDatCho(maDatCho);
        response.setTenHanhKhach(datCho.getHanhKhach().getHoVaTen());
        response.setGiaVe(datCho.getGiaVe());
        response.setTongKhuyenMai(calculation.getTongKhuyenMai());
        response.setPhiHuyVe(policy.getPhiHuy());
        response.setSoTienHoan(calculation.getSoTienHoan());
        response.setLyDo(lyDo);

        // Lưu yêu cầu hoàn tiền (tạo record trong bảng hoàn tiền nếu cần)
        // Trong thực tế sẽ có bảng HoanTien để lưu yêu cầu

        log.info("Yêu cầu hoàn tiền cho đặt chỗ {}: Hạng vé={}, Tiền hoàn={}", 
                maDatCho, datCho.getHangVe().getTenHangVe(), calculation.getSoTienHoan());

        return ApiResponse.success("Yêu cầu hoàn tiền đã được tạo", response);
    }

    /**
     * Xử lý hoàn tiền thành công
     * Giải phóng ghế và cập nhật trạng thái
     */
    @Transactional(rollbackFor = Exception.class)
    public void processRefund(int maDatCho) {
        DatCho datCho = datChoRepository.findById(maDatCho)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đặt chỗ"));

        // Check Refund Policy
        RefundPolicy policy = checkRefundPolicy(datCho);
        if (!policy.isRefundable()) {
            throw new IllegalArgumentException(policy.getMessage());
        }

        // Step 1: Giải phóng ghế (xóa GheDaDat)
        releaseSeat(datCho);

        // Step 2: Cập nhật trạng thái đặt chỗ
        datCho.setTrangThai("CANCELLED");
        datChoRepository.save(datCho);

        // Step 3: Update soluong_daban trong bảng giachuyenbay (giảm đi 1)
        updateGiaChuyenBaySoLuongDaBan(datCho);

        // Step 4: Cập nhật trạng thái thanh toán
        TrangThaiThanhToan thanhToan = trangThaiThanhToanRepository.findByDatCho_MaDatCho(maDatCho);
        if (thanhToan != null) {
            thanhToan.setDaThanhToan('R'); // R = Refunded
            trangThaiThanhToanRepository.save(thanhToan);
        }

        log.info("Đã xử lý hoàn tiền thành công cho đặt chỗ {}", maDatCho);
    }

    /**
     * Check điều kiện hạng vé (Refund Policy)
     * Vé hạng "Promo/Siêu tiết kiệm" thường không được hoàn
     * Vé hạng "Thương gia" có thể hoàn 100% hoặc mất phí
     */
    private RefundPolicy checkRefundPolicy(DatCho datCho) {
        HangVe hangVe = datCho.getHangVe();
        String tenHangVe = hangVe.getTenHangVe().toLowerCase();

        RefundPolicy policy = new RefundPolicy();
        policy.setRefundable(true);

        // Kiểm tra theo tên hạng vé
        if (tenHangVe.contains("promo") || tenHangVe.contains("khuyến mãi") 
                || tenHangVe.contains("siêu tiết kiệm") || tenHangVe.contains("economy saver")) {
            // Vé Promo/Siêu tiết kiệm - KHÔNG được hoàn
            policy.setRefundable(false);
            policy.setPhiHuy(BigDecimal.ZERO);
            policy.setMessage("Vé hạng " + hangVe.getTenHangVe() + " không được hoàn tiền theo quy định");
        } else if (tenHangVe.contains("thương gia") || tenHangVe.contains("business")) {
            // Vé Thương gia - Hoàn 100%
            policy.setRefundable(true);
            policy.setPhiHuy(BigDecimal.ZERO);
            policy.setTyLeHoan(BigDecimal.valueOf(100));
            policy.setMessage("Vé hạng Thương gia được hoàn 100% phí vé");
        } else if (tenHangVe.contains("phổ thông") || tenHangVe.contains("economy")) {
            // Vé Phổ thông/Economy - Hoàn với phí hủy
            policy.setRefundable(true);
            // Phí hủy: 10-20% tùy thời điểm hủy
            // Trong thực tế, cần check thời gian hủy so với thời gian bay
            policy.setPhiHuy(datCho.getGiaVe().multiply(BigDecimal.valueOf(0.15))); // 15% phí hủy
            policy.setTyLeHoan(BigDecimal.valueOf(85));
            policy.setMessage("Vé hạng Phổ thông được hoàn 85% phí vé (trừ 15% phí hủy)");
        } else {
            // Mặc định - Hoàn 90%
            policy.setRefundable(true);
            policy.setPhiHuy(datCho.getGiaVe().multiply(BigDecimal.valueOf(0.10)));
            policy.setTyLeHoan(BigDecimal.valueOf(90));
            policy.setMessage("Vé được hoàn 90% phí vé (trừ 10% phí hủy)");
        }

        return policy;
    }

    /**
     * Tính toán số tiền hoàn thực tế
     * Công thức: Tiền hoàn = (Giá vé + Thuế phí) - (Khuyến mãi đã dùng) - (Phí hủy vé)
     */
    private HoanTienCalculation calculateRefundAmount(DatCho datCho, RefundPolicy policy) {
        BigDecimal giaVe = datCho.getGiaVe();
        
        // Lấy tổng khuyến mãi đã áp dụng
        BigDecimal tongKhuyenMai = khuyenMaiService.getTongKhuyenMai(datCho.getMaDatCho());
        
        // Tính phí hủy
        BigDecimal phiHuy = policy.getPhiHuy();
        
        // Tính số tiền hoàn: (Giá vé - Khuyến mãi - Phí hủy)
        // Không hoàn tiền nếu kết quả âm
        BigDecimal giaVeSauKM = giaVe.subtract(tongKhuyenMai);
        BigDecimal soTienHoan = giaVeSauKM.subtract(phiHuy);
        
        if (soTienHoan.compareTo(BigDecimal.ZERO) < 0) {
            soTienHoan = BigDecimal.ZERO;
        }

        HoanTienCalculation calculation = new HoanTienCalculation();
        calculation.setGiaVe(giaVe);
        calculation.setTongKhuyenMai(tongKhuyenMai);
        calculation.setPhiHuy(phiHuy);
        calculation.setSoTienHoan(soTienHoan);

        log.info("Tính toán hoàn tiền cho đặt {}: Giá vé={}, Khuyến mãi={}, Phí hủy={}, Tiền hoàn={}", 
                datCho.getMaDatCho(), giaVe, tongKhuyenMai, phiHuy, soTienHoan);

        return calculation;
    }

    /**
     * Giải phóng ghế (Inventory Return)
     * Xóa record trong bảng ghe_da_dat
     */
    private void releaseSeat(DatCho datCho) {
        int maChuyenBay = datCho.getChuyenBay().getMaChuyenBay();
        ChiTietGhe chiTietGhe = datCho.getChiTietGhe();
        
        if (chiTietGhe != null) {
            int maGhe = chiTietGhe.getMaGhe();
            // Xóa GheDaDat
            gheDaDatRepository.deleteByChuyenBay_MaChuyenBayAndGhe_MaGhe(maChuyenBay, maGhe);
            log.info("Đã giải phóng ghế {} cho chuyến bay {}", maGhe, maChuyenBay);
        } else {
            log.info("Đặt chỗ không có ghế cụ thể, bỏ qua giải phóng ghế");
        }
    }

    /**
     * Update soluong_daban trong bảng giachuyenbay (giảm đi 1)
     * Để bán lại ghế đó cho người khác
     */
    private void updateGiaChuyenBaySoLuongDaBan(DatCho datCho) {
        int maChuyenBay = datCho.getChuyenBay().getMaChuyenBay();
        int maHangVe = datCho.getHangVe().getMaHangVe();
        int maTuyenBay = datCho.getChuyenBay().getTuyenBay().getMaTuyenBay();

        GiaChuyenBay giaChuyenBay = giaChuyenBayRepository
                .findByTuyenBay_MaTuyenBayAndHangVe_MaHangVe(maTuyenBay, maHangVe);
        
        if (giaChuyenBay != null && giaChuyenBay.getSoLuongDaBan() > 0) {
            giaChuyenBay.setSoLuongDaBan(giaChuyenBay.getSoLuongDaBan() - 1);
            giaChuyenBayRepository.save(giaChuyenBay);
            
            log.info("Đã cập nhật soluong_daban cho maGia={}: {}", giaChuyenBay.getMaGia(), giaChuyenBay.getSoLuongDaBan());
        }
    }

    /**
     * Class nội bộ cho Refund Policy
     */
    private static class RefundPolicy {
        private boolean refundable;
        private BigDecimal phiHuy;
        private BigDecimal tyLeHoan;
        private String message;

        public boolean isRefundable() { return refundable; }
        public void setRefundable(boolean refundable) { this.refundable = refundable; }
        public BigDecimal getPhiHuy() { return phiHuy; }
        public void setPhiHuy(BigDecimal phiHuy) { this.phiHuy = phiHuy; }
        public BigDecimal getTyLeHoan() { return tyLeHoan; }
        public void setTyLeHoan(BigDecimal tyLeHoan) { this.tyLeHoan = tyLeHoan; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    /**
     * Class nội bộ cho tính toán hoàn tiền
     */
    private static class HoanTienCalculation {
        private BigDecimal giaVe;
        private BigDecimal tongKhuyenMai;
        private BigDecimal phiHuy;
        private BigDecimal soTienHoan;

        public BigDecimal getGiaVe() { return giaVe; }
        public void setGiaVe(BigDecimal giaVe) { this.giaVe = giaVe; }
        public BigDecimal getTongKhuyenMai() { return tongKhuyenMai; }
        public void setTongKhuyenMai(BigDecimal tongKhuyenMai) { this.tongKhuyenMai = tongKhuyenMai; }
        public BigDecimal getPhiHuy() { return phiHuy; }
        public void setPhiHuy(BigDecimal phiHuy) { this.phiHuy = phiHuy; }
        public BigDecimal getSoTienHoan() { return soTienHoan; }
        public void setSoTienHoan(BigDecimal soTienHoan) { this.soTienHoan = soTienHoan; }
    }

    /**
     * Response cho yêu cầu hoàn tiền (inner class - dùng cho nội bộ service)
     */
    public static class RefundResponse {
        private int maDatCho;
        private String tenHanhKhach;
        private BigDecimal giaVe;
        private BigDecimal tongKhuyenMai;
        private BigDecimal phiHuyVe;
        private BigDecimal soTienHoan;
        private String lyDo;

        public int getMaDatCho() { return maDatCho; }
        public void setMaDatCho(int maDatCho) { this.maDatCho = maDatCho; }
        public String getTenHanhKhach() { return tenHanhKhach; }
        public void setTenHanhKhach(String tenHanhKhach) { this.tenHanhKhach = tenHanhKhach; }
        public BigDecimal getGiaVe() { return giaVe; }
        public void setGiaVe(BigDecimal giaVe) { this.giaVe = giaVe; }
        public BigDecimal getTongKhuyenMai() { return tongKhuyenMai; }
        public void setTongKhuyenMai(BigDecimal tongKhuyenMai) { this.tongKhuyenMai = tongKhuyenMai; }
        public BigDecimal getPhiHuyVe() { return phiHuyVe; }
        public void setPhiHuyVe(BigDecimal phiHuyVe) { this.phiHuyVe = phiHuyVe; }
        public BigDecimal getSoTienHoan() { return soTienHoan; }
        public void setSoTienHoan(BigDecimal soTienHoan) { this.soTienHoan = soTienHoan; }
        public String getLyDo() { return lyDo; }
        public void setLyDo(String lyDo) { this.lyDo = lyDo; }
    }

    // ==================== QUẢN LÝ HOÀN TIỀN ====================

    private final HoanTienRepository hoanTienRepository;

    /**
     * Lấy danh sách hoàn tiền với bộ lọc và tìm kiếm
     */
    public List<HoanTienResponse> getAllHoanTien(
            String search,
            String trangThai,
            LocalDateTime tuNgay,
            LocalDateTime denNgay
    ) {
        Specification<HoanTien> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by trạng thái
            if (trangThai != null && !trangThai.isEmpty()) {
                predicates.add(cb.equal(root.get("trangThai"), trangThai));
            }

            // Filter by date range
            if (tuNgay != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("ngayYeuCau"), tuNgay));
            }
            if (denNgay != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("ngayYeuCau"), denNgay));
            }

            // Search by multiple fields
            if (search != null && !search.isEmpty()) {
                String searchLower = "%" + search.toLowerCase() + "%";
                Predicate searchPredicate = cb.or(
                    cb.like(cb.lower(root.get("datCho").get("hanhKhach").get("hoVaTen")), searchLower),
                    cb.like(cb.lower(root.get("datCho").get("hanhKhach").get("email")), searchLower),
                    cb.like(cb.lower(root.get("lyDoHoanTien")), searchLower)
                );
                predicates.add(searchPredicate);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<HoanTien> hoanTienList = hoanTienRepository.findAll(spec);
        return hoanTienList.stream()
                .map(this::mapToHoanTienResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết hoàn tiền theo ID
     */
    public HoanTienDetailResponse getHoanTienById(Integer maHoanTien) {
        HoanTien hoanTien = hoanTienRepository.findById(maHoanTien)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu hoàn tiền"));
        return mapToHoanTienDetailResponse(hoanTien);
    }

    /**
     * Duyệt hoàn tiền
     */
    @Transactional(rollbackFor = Exception.class)
    public HoanTienResponse duyetHoanTien(Integer maHoanTien, String nguoiXuLy, String ghiChu) {
        HoanTien hoanTien = hoanTienRepository.findById(maHoanTien)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu hoàn tiền"));

        if (!hoanTien.isPending()) {
            throw new IllegalArgumentException("Yêu cầu hoàn tiền không ở trạng thái chờ xử lý");
        }

        // Cập nhật trạng thái
        hoanTien.setTrangThai("DA_HOAN_TIEN");
        hoanTien.setNguoiXuLy(nguoiXuLy);
        hoanTien.setNgayHoan(LocalDateTime.now());
        if (ghiChu != null && !ghiChu.isEmpty()) {
            hoanTien.setGhiChu(ghiChu);
        }

        hoanTienRepository.save(hoanTien);

        // Xử lý hoàn tiền (giải phóng ghế, cập nhật trạng thái)
        processRefund(hoanTien.getDatCho().getMaDatCho());

        log.info("Đã duyệt hoàn tiền {} bởi {}", maHoanTien, nguoiXuLy);
        return mapToHoanTienResponse(hoanTien);
    }

    /**
     * Từ chối hoàn tiền
     */
    @Transactional(rollbackFor = Exception.class)
    public HoanTienResponse tuChoiHoanTien(Integer maHoanTien, String nguoiXuLy, String lyDoTuChoi, String ghiChu) {
        HoanTien hoanTien = hoanTienRepository.findById(maHoanTien)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu hoàn tiền"));

        if (!hoanTien.isPending()) {
            throw new IllegalArgumentException("Yêu cầu hoàn tiền không ở trạng thái chờ xử lý");
        }

        // Cập nhật trạng thái
        hoanTien.setTrangThai("TU_CHOI");
        hoanTien.setNguoiXuLy(nguoiXuLy);
        hoanTien.setNgayHoan(LocalDateTime.now());
        
        // Ghi chú lý do từ chối
        String fullGhiChu = "Từ chối: " + lyDoTuChoi;
        if (ghiChu != null && !ghiChu.isEmpty()) {
            fullGhiChu += " | " + ghiChu;
        }
        hoanTien.setGhiChu(fullGhiChu);

        hoanTienRepository.save(hoanTien);

        log.info("Đã từ chối hoàn tiền {} bởi {} - Lý do: {}", maHoanTien, nguoiXuLy, lyDoTuChoi);
        return mapToHoanTienResponse(hoanTien);
    }

    /**
     * Lấy thống kê hoàn tiền
     */
    public HoanTienThongKeDTO getThongKe() {
        List<HoanTien> allHoanTien = hoanTienRepository.findAll();

        long tongYeuCau = allHoanTien.size();
        long choXuLy = allHoanTien.stream().filter(HoanTien::isPending).count();
        long daHoanTien = allHoanTien.stream().filter(HoanTien::isCompleted).count();
        long daTuChoi = allHoanTien.stream().filter(HoanTien::isRejected).count();

        BigDecimal tongTienDaHoan = allHoanTien.stream()
                .filter(HoanTien::isCompleted)
                .map(HoanTien::getSoTienHoan)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tongTienChoHoan = allHoanTien.stream()
                .filter(HoanTien::isPending)
                .map(HoanTien::getSoTienHoan)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return HoanTienThongKeDTO.builder()
                .tongYeuCau(tongYeuCau)
                .choXuLy(choXuLy)
                .daHoanTien(daHoanTien)
                .daTuChoi(daTuChoi)
                .tongTienDaHoan(tongTienDaHoan)
                .tongTienChoHoan(tongTienChoHoan)
                .build();
    }

    // ==================== MAPPER METHODS ====================

    private HoanTienResponse mapToHoanTienResponse(HoanTien hoanTien) {
        DatCho datCho = hoanTien.getDatCho();
        HanhKhach hanhKhach = datCho != null ? datCho.getHanhKhach() : null;
        TrangThaiThanhToan thanhToan = hoanTien.getTrangThaiThanhToan();
        
        // Lấy phương thức hoàn tiền từ hoanTien hoặc từ trangThaiThanhToan nếu null
        String phuongThucHoan = hoanTien.getPhuongThucHoan();
        if (phuongThucHoan == null && thanhToan != null) {
            phuongThucHoan = thanhToan.getPhuongThucThanhToan();
        }

        return HoanTienResponse.builder()
                .maHoanTien(hoanTien.getMaHP())
                .maHoaDon(datCho != null ? "HD" + String.format("%03d", datCho.getMaDatCho()) : null)
                .maDatVe(datCho != null ? datCho.getMaDatCho() : null)
                .hoTen(hanhKhach != null ? hanhKhach.getHoVaTen() : null)
                .email(hanhKhach != null ? hanhKhach.getEmail() : null)
                .soDienThoai(hanhKhach != null ? hanhKhach.getSoDienThoai() : null)
                .ngayYeuCau(hoanTien.getNgayYeuCau())
                .lyDo(hoanTien.getLyDoHoanTien())
                .soTienHoan(hoanTien.getSoTienHoan())
                .trangThai(hoanTien.getTrangThai())
                .phuongThucHoan(phuongThucHoan)
                .taiKhoanHoan(hoanTien.getTaiKhoanHoan())
                .nguoiXuLy(hoanTien.getNguoiXuLy())
                .ngayXuLy(hoanTien.getNgayHoan())
                .lyDoTuChoi(hoanTien.getGhiChu() != null && hoanTien.getGhiChu().startsWith("Từ chối:") 
                    ? hoanTien.getGhiChu().substring(9).split(" \\|")[0] 
                    : null)
                .build();
    }

    private HoanTienDetailResponse mapToHoanTienDetailResponse(HoanTien hoanTien) {
        DatCho datCho = hoanTien.getDatCho();
        HanhKhach hanhKhach = datCho != null ? datCho.getHanhKhach() : null;
        ChiTietChuyenBay chuyenBay = datCho != null ? datCho.getChuyenBay() : null;
        TrangThaiThanhToan thanhToan = hoanTien.getTrangThaiThanhToan();
        
        // Lấy phương thức hoàn tiền từ hoanTien hoặc từ trangThaiThanhToan nếu null
        String phuongThucHoan = hoanTien.getPhuongThucHoan();
        if (phuongThucHoan == null && thanhToan != null) {
            phuongThucHoan = thanhToan.getPhuongThucThanhToan();
        }

        return HoanTienDetailResponse.builder()
                .maHoanTien(hoanTien.getMaHP())
                .maHoaDon(datCho != null ? "HD" + String.format("%03d", datCho.getMaDatCho()) : null)
                .maDatVe(datCho != null ? datCho.getMaDatCho() : null)
                .hoTen(hanhKhach != null ? hanhKhach.getHoVaTen() : null)
                .email(hanhKhach != null ? hanhKhach.getEmail() : null)
                .soDienThoai(hanhKhach != null ? hanhKhach.getSoDienThoai() : null)
                .maChuyenBay(chuyenBay != null ? String.valueOf(chuyenBay.getMaChuyenBay()) : null)
                .sanBayDi(chuyenBay != null && chuyenBay.getTuyenBay() != null 
                    ? chuyenBay.getTuyenBay().getSanBayDi().getMaIATA() : null)
                .sanBayDen(chuyenBay != null && chuyenBay.getTuyenBay() != null 
                    ? chuyenBay.getTuyenBay().getSanBayDen().getMaIATA() : null)
                .ngayYeuCau(hoanTien.getNgayYeuCau())
                .lyDo(hoanTien.getLyDoHoanTien())
                .soTienHoan(hoanTien.getSoTienHoan())
                .giaVeGoc(datCho != null ? datCho.getGiaVe() : null)
                .phiHuy(BigDecimal.ZERO) // Cần tính toán nếu cần
                .trangThai(hoanTien.getTrangThai())
                .phuongThucHoan(phuongThucHoan)
                .taiKhoanHoan(hoanTien.getTaiKhoanHoan())
                .nguoiXuLy(hoanTien.getNguoiXuLy())
                .ngayXuLy(hoanTien.getNgayHoan())
                .lyDoTuChoi(hoanTien.getGhiChu() != null && hoanTien.getGhiChu().startsWith("Từ chối:") 
                    ? hoanTien.getGhiChu().substring(9).split(" \\|")[0] 
                    : null)
                .ghiChu(hoanTien.getGhiChu())
                .build();
    }
}
