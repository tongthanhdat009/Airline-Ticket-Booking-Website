package com.example.j2ee.service;

import com.example.j2ee.model.AuditLog;
import com.example.j2ee.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service cho AuditLog (Lịch sử thao tác)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Lấy tất cả audit log với phân trang
     */
    public Page<AuditLog> getAllAuditLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }

    /**
     * Lấy audit log theo ID
     */
    public AuditLog getAuditLogById(Long id) {
        return auditLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy audit log với ID: " + id));
    }

    /**
     * Tìm kiếm audit log với nhiều điều kiện
     */
    public Page<AuditLog> searchAuditLogs(
            String loaiThaoTac,
            String bangAnhHuong,
            String loaiTaiKhoan,
            LocalDateTime tuNgay,
            LocalDateTime denNgay,
            String search,
            Pageable pageable) {
        return auditLogRepository.searchAuditLogs(
                loaiThaoTac, bangAnhHuong, loaiTaiKhoan, tuNgay, denNgay, search, pageable);
    }

    /**
     * Tạo mới audit log
     */
    @Transactional
    public AuditLog createAuditLog(AuditLog auditLog) {
        if (auditLog.getThoiGian() == null) {
            auditLog.setThoiGian(LocalDateTime.now());
        }
        return auditLogRepository.save(auditLog);
    }

    /**
     * Xóa audit log theo ID
     */
    @Transactional
    public void deleteAuditLog(Long id) {
        auditLogRepository.deleteById(id);
    }

    /**
     * Lấy danh sách các loại thao tác
     */
    public List<String> getLoaiThaoTacList() {
        return auditLogRepository.findDistinctLoaiThaoTac();
    }

    /**
     * Lấy danh sách các bảng ảnh hưởng
     */
    public List<String> getBangAnhHuongList() {
        return auditLogRepository.findDistinctBangAnhHuong();
    }

    /**
     * Lấy thống kê tổng quan
     */
    public AuditLogStatistics getStatistics() {
        long totalLogs = auditLogRepository.count();
        long adminActions = auditLogRepository.countByLoaiTaiKhoan("ADMIN");
        long customerActions = auditLogRepository.countByLoaiTaiKhoan("CUSTOMER");
        long todayLogs = auditLogRepository.countTodayLogs();

        return new AuditLogStatistics(totalLogs, adminActions, customerActions, todayLogs);
    }

    /**
     * Ghi log thao tác tiện lợi
     */
    @Transactional
    public void logAction(
            String loaiThaoTac,
            String bangAnhHuong,
            int maBanGhi,
            String nguoiThucHien,
            String loaiTaiKhoan,
            String duLieuCu,
            String duLieuMoi,
            String moTa,
            String diaChiIp) {
        
        AuditLog logEntry = new AuditLog();
        logEntry.setLoaiThaoTac(loaiThaoTac);
        logEntry.setBangAnhHuong(bangAnhHuong);
        logEntry.setMaBanGhi(maBanGhi);
        logEntry.setNguoiThucHien(nguoiThucHien);
        logEntry.setLoaiTaiKhoan(loaiTaiKhoan);
        logEntry.setDuLieuCu(duLieuCu);
        logEntry.setDuLieuMoi(duLieuMoi);
        logEntry.setMoTa(moTa);
        logEntry.setDiaChiIp(diaChiIp);
        logEntry.setThoiGian(LocalDateTime.now());

        auditLogRepository.save(logEntry);
        log.debug("Đã ghi log: {} - {} - {}", loaiThaoTac, bangAnhHuong, nguoiThucHien);
    }

    /**
     * DTO cho thống kê audit log
     */
    public record AuditLogStatistics(
            long totalLogs,
            long adminActions,
            long customerActions,
            long todayLogs
    ) {}

    /**
     * Thống kê audit log trong khoảng thờ gian
     */
    public AuditLogStatistics getStatistics(LocalDateTime tuNgay, LocalDateTime denNgay) {
        List<AuditLog> logsInRange = auditLogRepository.findByThoiGianBetweenOrderByThoiGianDesc(
                tuNgay != null ? tuNgay : LocalDateTime.now().minusYears(1),
                denNgay != null ? denNgay : LocalDateTime.now());
        
        long totalLogs = logsInRange.size();
        long adminActions = logsInRange.stream().filter(l -> "ADMIN".equals(l.getLoaiTaiKhoan())).count();
        long customerActions = logsInRange.stream().filter(l -> "CUSTOMER".equals(l.getLoaiTaiKhoan())).count();
        long todayLogs = logsInRange.stream()
                .filter(l -> l.getThoiGian().toLocalDate().equals(LocalDateTime.now().toLocalDate()))
                .count();
        
        return new AuditLogStatistics(totalLogs, adminActions, customerActions, todayLogs);
    }

    /**
     * Export audit log ra PDF sử dụng JasperReports
     */
    public byte[] exportToPdf(
            String loaiThaoTac,
            String bangAnhHuong,
            String loaiTaiKhoan,
            LocalDateTime tuNgay,
            LocalDateTime denNgay,
            String search) throws Exception {
        
        // Lấy tất cả log không phân trang cho export
        List<AuditLog> logs = auditLogRepository.searchAuditLogs(
                loaiThaoTac, bangAnhHuong, loaiTaiKhoan, tuNgay, denNgay, search, Pageable.unpaged()).getContent();
        
        if (logs.isEmpty()) {
            throw new IllegalArgumentException("Không có dữ liệu để export");
        }
        
        // Load template
        ClassPathResource resource = new ClassPathResource("jasper/audit_log_report.jrxml");
        JasperReport jasperReport = JasperCompileManager.compileReport(resource.getInputStream());
        
        // Chuẩn bị parameters
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("reportTitle", "BÁO CÁO LỊCH SỬ THAO TÁC");
        parameters.put("reportDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
        parameters.put("totalRecords", logs.size());
        parameters.put("filterInfo", buildFilterInfo(loaiThaoTac, bangAnhHuong, loaiTaiKhoan, tuNgay, denNgay));
        
        // Tạo data source
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(logs);
        
        // Fill report
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);
        
        // Export to PDF
        return JasperExportManager.exportReportToPdf(jasperPrint);
    }
    
    /**
     * Export audit log ra Excel sử dụng Apache POI
     */
    public byte[] exportToExcel(
            String loaiThaoTac,
            String bangAnhHuong,
            String loaiTaiKhoan,
            LocalDateTime tuNgay,
            LocalDateTime denNgay,
            String search) throws Exception {
        
        // Lấy tất cả log không phân trang cho export
        List<AuditLog> logs = auditLogRepository.searchAuditLogs(
                loaiThaoTac, bangAnhHuong, loaiTaiKhoan, tuNgay, denNgay, search, Pageable.unpaged()).getContent();
        
        if (logs.isEmpty()) {
            throw new IllegalArgumentException("Không có dữ liệu để export");
        }
        
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            
            // Tạo sheet
            Sheet sheet = workbook.createSheet("Audit Logs");
            
            // Tạo style cho header
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            
            // Tạo header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                    "STT", "Mã Log", "Loại Thao Tác", "Bảng Ảnh Hưởng", "Mã Bản Ghi",
                    "Ngưởi Thực Hiện", "Loại Tài Khoản", "Mô Tả", "Địa Chỉ IP", "Thờ Gian"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Tạo data rows
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
            int rowNum = 1;
            
            for (AuditLog log : logs) {
                Row row = sheet.createRow(rowNum++);
                
                // STT
                row.createCell(0).setCellValue(rowNum - 1);
                row.getCell(0).setCellStyle(dataStyle);
                
                // Mã Log
                row.createCell(1).setCellValue(log.getMaLog() != null ? log.getMaLog() : 0);
                row.getCell(1).setCellStyle(dataStyle);
                
                // Loại Thao Tác
                row.createCell(2).setCellValue(log.getLoaiThaoTac() != null ? log.getLoaiThaoTac() : "");
                row.getCell(2).setCellStyle(dataStyle);
                
                // Bảng Ảnh Hưởng
                row.createCell(3).setCellValue(log.getBangAnhHuong() != null ? log.getBangAnhHuong() : "");
                row.getCell(3).setCellStyle(dataStyle);
                
                // Mã Bản Ghi
                row.createCell(4).setCellValue(log.getMaBanGhi());
                row.getCell(4).setCellStyle(dataStyle);
                
                // Ngưởi Thực Hiện
                row.createCell(5).setCellValue(log.getNguoiThucHien() != null ? log.getNguoiThucHien() : "");
                row.getCell(5).setCellStyle(dataStyle);
                
                // Loại Tài Khoản
                row.createCell(6).setCellValue(log.getLoaiTaiKhoan() != null ? log.getLoaiTaiKhoan() : "");
                row.getCell(6).setCellStyle(dataStyle);
                
                // Mô Tả
                row.createCell(7).setCellValue(log.getMoTa() != null ? log.getMoTa() : "");
                row.getCell(7).setCellStyle(dataStyle);
                
                // Địa Chỉ IP
                row.createCell(8).setCellValue(log.getDiaChiIp() != null ? log.getDiaChiIp() : "");
                row.getCell(8).setCellStyle(dataStyle);
                
                // Thờ Gian
                row.createCell(9).setCellValue(log.getThoiGian() != null ? 
                        log.getThoiGian().format(dateFormatter) : "");
                row.getCell(9).setCellStyle(dateStyle);
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            // Write to output stream
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    /**
     * Tạo style cho header cell
     */
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        
        return style;
    }
    
    /**
     * Tạo style cho data cell
     */
    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        
        return style;
    }
    
    /**
     * Tạo style cho date cell
     */
    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        
        return style;
    }
    
    /**
     * Xây dựng thông tin filter cho báo cáo
     */
    private String buildFilterInfo(
            String loaiThaoTac,
            String bangAnhHuong,
            String loaiTaiKhoan,
            LocalDateTime tuNgay,
            LocalDateTime denNgay) {
        
        StringBuilder sb = new StringBuilder();
        
        if (loaiThaoTac != null && !loaiThaoTac.isEmpty()) {
            sb.append("Loại thao tác: ").append(loaiThaoTac).append(" | ");
        }
        if (bangAnhHuong != null && !bangAnhHuong.isEmpty()) {
            sb.append("Bảng: ").append(bangAnhHuong).append(" | ");
        }
        if (loaiTaiKhoan != null && !loaiTaiKhoan.isEmpty()) {
            sb.append("Loại TK: ").append(loaiTaiKhoan).append(" | ");
        }
        if (tuNgay != null) {
            sb.append("Từ: ").append(tuNgay.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))).append(" | ");
        }
        if (denNgay != null) {
            sb.append("Đến: ").append(denNgay.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))).append(" | ");
        }
        
        String result = sb.toString();
        return result.isEmpty() ? "Tất cả" : result.substring(0, result.length() - 3);
    }
}
