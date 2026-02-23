package com.example.j2ee.service;

import com.example.j2ee.dto.doi_soat.DoiSoatDetailResponse;
import com.example.j2ee.dto.doi_soat.DoiSoatResponse;
import com.example.j2ee.dto.doi_soat.RunReconciliationRequest;
import com.example.j2ee.dto.doi_soat.UpdateReconciliationNoteRequest;
import com.example.j2ee.model.DonHang;
import com.example.j2ee.model.HoaDon;
import com.example.j2ee.model.TrangThaiThanhToan;
import com.example.j2ee.model.VnPayTransactionLog;
import com.example.j2ee.repository.DonHangRepository;
import com.example.j2ee.repository.HoaDonRepository;
import com.example.j2ee.repository.TrangThaiThanhToanRepository;
import com.example.j2ee.repository.VnPayTransactionLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service quản lý đối soát giao dịch - so khớp số tiền hóa đơn với VNPAY
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DoiSoatGiaoDichService {

    private final HoaDonRepository hoaDonRepository;
    private final TrangThaiThanhToanRepository trangThaiThanhToanRepository;
    private final DonHangRepository donHangRepository;
    private final VnPayTransactionLogRepository vnPayTransactionLogRepository;

    /**
     * Kiểm tra đối soát cho một hóa đơn cụ thể
     */
    public DoiSoatDetailResponse checkReconciliation(Integer maHoaDon) {
        HoaDon hoaDon = hoaDonRepository.findById(maHoaDon)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn"));

        TrangThaiThanhToan thanhToan = trangThaiThanhToanRepository.findByDonHang_MaDonHang(
                hoaDon.getDonHang().getMaDonHang()
        );

        return mapToDoiSoatDetailResponse(hoaDon, thanhToan);
    }

    /**
     * Lấy danh sách đối soát với bộ lọc
     */
    public List<DoiSoatResponse> getAllReconciliations(
            String search,
            String trangThai,
            LocalDate tuNgay,
            LocalDate denNgay,
            String sort
    ) {
        Specification<HoaDon> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by trang thái
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

        // Map to reconciliation responses
        return hoaDonList.stream()
                .map(hoaDon -> {
                    TrangThaiThanhToan thanhToan = trangThaiThanhToanRepository
                            .findByDonHang_MaDonHang(hoaDon.getDonHang().getMaDonHang());
                    return mapToDoiSoatResponse(hoaDon, thanhToan);
                })
                .collect(Collectors.toList());
    }

    /**
     * Lấy thống kê đối soát
     */
    public DoiSoatThongKeDTO getReconciliationStatistics() {
        List<HoaDon> allHoaDon = hoaDonRepository.findAll();

        long tongSoGiaoDich = allHoaDon.size();
        long soGiaoDichHopLe = allHoaDon.stream()
                .filter(HoaDon::isDaPhatHanh)
                .count();

        // Count matched and unmatched
        long soGiaoDichKhop = 0;
        long soGiaoDichKhongKhop = 0;
        BigDecimal tongTienHoaDon = BigDecimal.ZERO;
        BigDecimal tongTienVNPAY = BigDecimal.ZERO;

        for (HoaDon hoaDon : allHoaDon) {
            if (!hoaDon.isDaPhatHanh()) {
                continue;
            }

            TrangThaiThanhToan thanhToan = trangThaiThanhToanRepository
                    .findByDonHang_MaDonHang(hoaDon.getDonHang().getMaDonHang());

            tongTienHoaDon = tongTienHoaDon.add(hoaDon.getTongThanhToan());

            if (thanhToan != null) {
                tongTienVNPAY = tongTienVNPAY.add(thanhToan.getSoTien());

                if (isAmountMatched(hoaDon.getTongThanhToan(), thanhToan.getSoTien())) {
                    soGiaoDichKhop++;
                } else {
                    soGiaoDichKhongKhop++;
                }
            } else {
                soGiaoDichKhongKhop++;
            }
        }

        BigDecimal chenhLech = tongTienHoaDon.subtract(tongTienVNPAY);

        return DoiSoatThongKeDTO.builder()
                .tongSoGiaoDich(tongSoGiaoDich)
                .soGiaoDichHopLe(soGiaoDichHopLe)
                .soGiaoDichKhop(soGiaoDichKhop)
                .soGiaoDichKhongKhop(soGiaoDichKhongKhop)
                .tongTienHoaDon(tongTienHoaDon)
                .tongTienVNPAY(tongTienVNPAY)
                .chenhLech(chenhLech)
                .build();
    }

    // ==================== HELPER METHODS ====================

    /**
     * Kiểm tra hai số tiền có khớp nhau không
     */
    private boolean isAmountMatched(BigDecimal invoiceAmount, BigDecimal vnpayAmount) {
        if (invoiceAmount == null || vnpayAmount == null) {
            return false;
        }
        return invoiceAmount.compareTo(vnpayAmount) == 0;
    }

    /**
     * Xác định trạng thái đối soát
     */
    private String determineStatus(BigDecimal invoiceAmount, BigDecimal vnpayAmount) {
        if (isAmountMatched(invoiceAmount, vnpayAmount)) {
            return "MATCHED";
        }
        return "UNMATCHED";
    }

    /**
     * Tính chênh lệch giữa hai số tiền
     */
    private BigDecimal calculateDifference(BigDecimal invoiceAmount, BigDecimal vnpayAmount) {
        if (invoiceAmount == null) {
            return vnpayAmount != null ? vnpayAmount.negate() : BigDecimal.ZERO;
        }
        if (vnpayAmount == null) {
            return invoiceAmount;
        }
        return invoiceAmount.subtract(vnpayAmount);
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

    // ==================== MAPPER METHODS ====================

    private DoiSoatResponse mapToDoiSoatResponse(HoaDon hoaDon, TrangThaiThanhToan thanhToan) {
        DonHang donHang = hoaDon.getDonHang();

        BigDecimal invoiceAmount = hoaDon.getTongThanhToan();
        BigDecimal vnpayAmount = thanhToan != null ? thanhToan.getSoTien() : null;
        String status = determineStatus(invoiceAmount, vnpayAmount);
        BigDecimal amountDifference = calculateDifference(invoiceAmount, vnpayAmount);

        return DoiSoatResponse.builder()
                .maHoaDon(hoaDon.getMaHoaDon())
                .soHoaDon(hoaDon.getSoHoaDon())
                .pnr(donHang != null ? donHang.getPnr() : null)
                .invoiceAmount(invoiceAmount)
                .vnpayAmount(vnpayAmount)
                .status(status)
                .amountDifference(amountDifference)
                .vnpayTransactionId(thanhToan != null ? thanhToan.getTransactionCode() : null)
                .ngayLap(hoaDon.getNgayLap())
                .build();
    }

    private DoiSoatDetailResponse mapToDoiSoatDetailResponse(HoaDon hoaDon, TrangThaiThanhToan thanhToan) {
        DonHang donHang = hoaDon.getDonHang();

        BigDecimal invoiceAmount = hoaDon.getTongThanhToan();
        BigDecimal vnpayAmount = thanhToan != null ? thanhToan.getSoTien() : null;
        String status = determineStatus(invoiceAmount, vnpayAmount);
        BigDecimal amountDifference = calculateDifference(invoiceAmount, vnpayAmount);

        return DoiSoatDetailResponse.builder()
                .maHoaDon(hoaDon.getMaHoaDon())
                .soHoaDon(hoaDon.getSoHoaDon())
                .pnr(donHang != null ? donHang.getPnr() : null)
                .invoiceAmount(invoiceAmount)
                .vnpayAmount(vnpayAmount)
                .status(status)
                .amountDifference(amountDifference)
                .vnpayTransactionId(thanhToan != null ? thanhToan.getTransactionCode() : null)
                .ngayLap(hoaDon.getNgayLap())
                .createdAt(hoaDon.getCreatedAt())
                .updatedAt(hoaDon.getUpdatedAt())
                .vnpayResponseCode(thanhToan != null ? thanhToan.getTrangThai() : null)
                .vnpayTransactionStatus(thanhToan != null ?
                        (thanhToan.getDaThanhToan() == 'Y' ? "SUCCESS" : "PENDING") : null)
                .vnpayPayDate(thanhToan != null ? thanhToan.getThoigianThanhToan() : null)
                .emailNguoiDat(donHang != null ? donHang.getEmailNguoiDat() : null)
                .soDienThoaiNguoiDat(donHang != null ? donHang.getSoDienThoaiNguoiDat() : null)
                .hoTenNguoiDat(donHang != null && donHang.getHanhKhachNguoiDat() != null
                    ? donHang.getHanhKhachNguoiDat().getHoVaTen() : null)
                .trangThaiHoaDon(hoaDon.getTrangThai())
                .build();
    }

    /**
     * DTO cho thống kê đối soát
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class DoiSoatThongKeDTO {
        private long tongSoGiaoDich;
        private long soGiaoDichHopLe;
        private long soGiaoDichKhop;
        private long soGiaoDichKhongKhop;
        private BigDecimal tongTienHoaDon;
        private BigDecimal tongTienVNPAY;
        private BigDecimal chenhLech;
    }

    // ==================== RECONCILIATION WITH VNPAY METHODS ====================

    /**
     * Lấy danh sách VNPay logs theo mã giao dịch (vnpTxnRef)
     *
     * @param vnpTxnRef Mã giao dịch VNPay
     * @return Danh sách VNPay logs
     */
    public List<VnPayTransactionLog> getVNPayLogsByTxnRef(String vnpTxnRef) {
        log.info("Lấy VNPay logs theo vnpTxnRef: {}", vnpTxnRef);
        return vnPayTransactionLogRepository.findByVnpTxnRefOrderByIpnReceivedAtDesc(vnpTxnRef);
    }

    /**
     * So sánh chi tiết với VNPay logs cho một hóa đơn
     * Cải thiện từ checkReconciliation - bao gồm cả VNPay logs
     *
     * @param maHoaDon Mã hóa đơn
     * @return DoiSoatDetailResponse với đầy đủ thông tin
     */
    public DoiSoatDetailResponse reconcileWithVNPay(Integer maHoaDon) {
        HoaDon hoaDon = hoaDonRepository.findById(maHoaDon)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn"));

        TrangThaiThanhToan thanhToan = trangThaiThanhToanRepository.findByDonHang_MaDonHang(
                hoaDon.getDonHang().getMaDonHang()
        );

        DoiSoatDetailResponse response = mapToDoiSoatDetailResponse(hoaDon, thanhToan);

        // Thêm thông tin VNPay logs nếu có transaction code
        if (thanhToan != null && thanhToan.getTransactionCode() != null) {
            List<VnPayTransactionLog> vnPayLogs = getVNPayLogsByTxnRef(thanhToan.getTransactionCode());
            // Có thể thêm thông tin logs vào response nếu cần
            log.debug("Tìm thấy {} VNPay logs cho transaction {}", vnPayLogs.size(), thanhToan.getTransactionCode());
        }

        return response;
    }

    /**
     * Cập nhật ghi chú xử lý đối soát cho một hóa đơn
     *
     * @param maHoaDon Mã hóa đơn
     * @param request Request chứa ghi chú và người xử lý
     */
    @Transactional
    public void updateReconciliationNote(Integer maHoaDon, UpdateReconciliationNoteRequest request) {
        HoaDon hoaDon = hoaDonRepository.findById(maHoaDon)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn"));

        hoaDon.setGhiChuDoiSoat(request.getGhiChu());
        hoaDon.setNguoiXuLyDoiSoat(request.getNguoiXuLy());
        hoaDon.setNgayXuLyDoiSoat(LocalDateTime.now());
        hoaDon.setTrangThaiDoiSoat(request.getTrangThai() != null ? request.getTrangThai() : "RESOLVED");

        hoaDonRepository.save(hoaDon);

        log.info("Đã cập nhật ghi chú đối soát cho hóa đơn {}: {}, bởi {}",
                maHoaDon, request.getGhiChu(), request.getNguoiXuLy());
    }

    /**
     * Chạy đối soát thủ công theo khoảng thời gian
     * So sánh các hóa đơn trong khoảng thời gian với VNPay logs
     *
     * @param request Request chứa khoảng thời gian và options
     * @return Danh sách kết quả đối soát
     */
    public List<DoiSoatResponse> runManualReconciliation(RunReconciliationRequest request) {
        log.info("Chạy đối soát thủ công từ {} đến {}", request.getTuNgay(), request.getDenNgay());

        Specification<HoaDon> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by date range
            if (request.getTuNgay() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("ngayLap"), request.getTuNgay().atStartOfDay()));
            }
            if (request.getDenNgay() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("ngayLap"), request.getDenNgay().plusDays(1).atStartOfDay()));
            }

            // Chỉ lấy hóa đơn đã phát hành
            predicates.add(cb.equal(root.get("trangThai"), "DA_PHAT_HANH"));

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<HoaDon> hoaDonList = hoaDonRepository.findAll(spec);

        // Map to reconciliation responses
        List<DoiSoatResponse> results = hoaDonList.stream()
                .map(hoaDon -> {
                    TrangThaiThanhToan thanhToan = trangThaiThanhToanRepository
                            .findByDonHang_MaDonHang(hoaDon.getDonHang().getMaDonHang());
                    DoiSoatResponse response = mapToDoiSoatResponse(hoaDon, thanhToan);

                    // Filter out matched transactions if not included
                    if (!request.getIncludeMatched() && "MATCHED".equals(response.getStatus())) {
                        return null;
                    }
                    return response;
                })
                .filter(r -> r != null)
                .collect(Collectors.toList());

        log.info("Hoàn tất đối soát thủ công. Tìm thấy {} giao dịch cần xử lý", results.size());

        return results;
    }

    /**
     * Lấy các giao dịch đang chờ xử lý đối soát
     *
     * @return Danh sách các hóa đơn có trangthai_doisoat = PENDING
     */
    public List<DoiSoatResponse> getPendingReconciliations() {
        Specification<HoaDon> spec = (root, query, cb) -> {
            return cb.equal(root.get("trangThaiDoiSoat"), "PENDING");
        };

        List<HoaDon> hoaDonList = hoaDonRepository.findAll(spec);

        return hoaDonList.stream()
                .map(hoaDon -> {
                    TrangThaiThanhToan thanhToan = trangThaiThanhToanRepository
                            .findByDonHang_MaDonHang(hoaDon.getDonHang().getMaDonHang());
                    return mapToDoiSoatResponse(hoaDon, thanhToan);
                })
                .collect(Collectors.toList());
    }

    /**
     * Xuất báo cáo đối soát ra Excel
     *
     * @param tuNgay Từ ngày
     * @param denNgay Đến ngày
     * @return Byte array của file Excel
     */
    public byte[] exportReconciliationReport(LocalDate tuNgay, LocalDate denNgay) {
        log.info("Xuất báo cáo đối soát từ {} đến {}", tuNgay, denNgay);

        // Lấy dữ liệu đối soát
        RunReconciliationRequest request = RunReconciliationRequest.builder()
                .tuNgay(tuNgay)
                .denNgay(denNgay)
                .includeMatched(true)
                .build();
        List<DoiSoatResponse> data = runManualReconciliation(request);

        try (org.apache.poi.xssf.usermodel.XSSFWorkbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook()) {
            org.apache.poi.xssf.usermodel.XSSFSheet sheet = workbook.createSheet("Doi Soat Giao Dich");

            // Tạo style cho header
            org.apache.poi.xssf.usermodel.XSSFCellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.xssf.usermodel.XSSFFont headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(org.apache.poi.ss.usermodel.IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.BLUE.getIndex());
            headerStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.CENTER);

            // Tạo style cho data
            org.apache.poi.xssf.usermodel.XSSFCellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.LEFT);

            // Style cho tiền tệ
            org.apache.poi.xssf.usermodel.XSSFCellStyle currencyStyle = workbook.createCellStyle();
            currencyStyle.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.RIGHT);
            org.apache.poi.ss.usermodel.DataFormat df = workbook.createDataFormat();
            currencyStyle.setDataFormat(df.getFormat("#,##0"));

            // Tạo header row
            org.apache.poi.xssf.usermodel.XSSFRow headerRow = sheet.createRow(0);
            String[] headers = {
                    "STT", "Mã Hóa Đơn", "Số Hóa Đơn", "PNR", "Mã GD VNPay",
                    "Số Tiền Hệ Thống", "Số Tiền VNPay", "Chênh Lệch",
                    "Trạng Thái", "Ngày Lập"
            };
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.xssf.usermodel.XSSFCell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Điền data
            int rowNum = 1;
            for (DoiSoatResponse item : data) {
                org.apache.poi.xssf.usermodel.XSSFRow row = sheet.createRow(rowNum++);

                row.createCell(0).setCellValue(rowNum - 1);
                row.createCell(1).setCellValue(item.getMaHoaDon());
                row.createCell(2).setCellValue(item.getSoHoaDon());
                row.createCell(3).setCellValue(item.getPnr());
                row.createCell(4).setCellValue(item.getVnpayTransactionId() != null ? item.getVnpayTransactionId() : "N/A");

                org.apache.poi.xssf.usermodel.XSSFCell cellHT = row.createCell(5);
                cellHT.setCellValue(item.getInvoiceAmount() != null ? item.getInvoiceAmount().doubleValue() : 0);
                cellHT.setCellStyle(currencyStyle);

                org.apache.poi.xssf.usermodel.XSSFCell cellVNP = row.createCell(6);
                cellVNP.setCellValue(item.getVnpayAmount() != null ? item.getVnpayAmount().doubleValue() : 0);
                cellVNP.setCellStyle(currencyStyle);

                org.apache.poi.xssf.usermodel.XSSFCell cellDiff = row.createCell(7);
                cellDiff.setCellValue(item.getAmountDifference() != null ? item.getAmountDifference().doubleValue() : 0);
                cellDiff.setCellStyle(currencyStyle);

                row.createCell(8).setCellValue("MATCHED".equals(item.getStatus()) ? "Khớp" : "Lệch");
                row.createCell(9).setCellValue(item.getNgayLap() != null ? item.getNgayLap().toString() : "");
            }

            // Auto resize columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // Ghi ra byte array
            try (java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream()) {
                workbook.write(outputStream);
                log.info("Xuất báo cáo thành công: {} dòng", data.size());
                return outputStream.toByteArray();
            }
        } catch (Exception e) {
            log.error("Lỗi khi xuất báo cáo Excel: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi khi xuất báo cáo: " + e.getMessage());
        }
    }
}
