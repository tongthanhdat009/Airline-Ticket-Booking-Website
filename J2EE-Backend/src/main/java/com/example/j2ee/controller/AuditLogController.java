package com.example.j2ee.controller;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.AuditLog;
import com.example.j2ee.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Controller cho AuditLog (Lịch sử thao tác)
 * Tích hợp RBAC với @RequirePermission
 */
@RestController
@RequestMapping("/admin/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Log", description = "API quản lý lịch sử thao tác")
public class AuditLogController {

    private final AuditLogService auditLogService;

    /**
     * Lấy danh sách tất cả audit log với phân trang và tìm kiếm
     */
    @GetMapping
    @RequirePermission(feature = "AUDITLOG", action = "VIEW")
    @Operation(summary = "Lấy danh sách audit log", description = "Yêu cầu quyền AUDITLOG_VIEW")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAllAuditLogs(
            @Parameter(description = "Số trang (bắt đầu từ 0)")
            @RequestParam(defaultValue = "0") int page,
            
            @Parameter(description = "Kích thước trang")
            @RequestParam(defaultValue = "20") int size,
            
            @Parameter(description = "Loại thao tác (CAP_NHAT, XOA, THEM_MOI, etc.)")
            @RequestParam(required = false) String loaiThaoTac,
            
            @Parameter(description = "Bảng ảnh hưởng (chuyenbay, datcho, etc.)")
            @RequestParam(required = false) String bangAnhHuong,
            
            @Parameter(description = "Loại tài khoản (ADMIN, CUSTOMER)")
            @RequestParam(required = false) String loaiTaiKhoan,
            
            @Parameter(description = "Từ ngày (ISO DateTime)")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            
            @Parameter(description = "Đến ngày (ISO DateTime)")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay,
            
            @Parameter(description = "Từ khóa tìm kiếm")
            @RequestParam(required = false) String search) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("thoiGian").descending());
        Page<AuditLog> logs = auditLogService.searchAuditLogs(
                loaiThaoTac, bangAnhHuong, loaiTaiKhoan, tuNgay, denNgay, search, pageable);

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách audit log thành công", logs));
    }

    /**
     * Lấy chi tiết audit log theo ID
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "AUDITLOG", action = "VIEW")
    @Operation(summary = "Lấy chi tiết audit log", description = "Yêu cầu quyền AUDITLOG_VIEW")
    public ResponseEntity<ApiResponse<AuditLog>> getAuditLogById(
            @Parameter(description = "ID của audit log")
            @PathVariable Long id) {
        AuditLog log = auditLogService.getAuditLogById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết audit log thành công", log));
    }

    /**
     * Lấy danh sách các loại thao tác
     */
    @GetMapping("/loai-thao-tac")
    @RequirePermission(feature = "AUDITLOG", action = "VIEW")
    @Operation(summary = "Lấy danh sách loại thao tác", description = "Yêu cầu quyền AUDITLOG_VIEW")
    public ResponseEntity<ApiResponse<List<String>>> getLoaiThaoTacList() {
        List<String> list = auditLogService.getLoaiThaoTacList();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách loại thao tác thành công", list));
    }

    /**
     * Lấy danh sách các bảng ảnh hưởng
     */
    @GetMapping("/bang-anh-huong")
    @RequirePermission(feature = "AUDITLOG", action = "VIEW")
    @Operation(summary = "Lấy danh sách bảng ảnh hưởng", description = "Yêu cầu quyền AUDITLOG_VIEW")
    public ResponseEntity<ApiResponse<List<String>>> getBangAnhHuongList() {
        List<String> list = auditLogService.getBangAnhHuongList();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bảng ảnh hưởng thành công", list));
    }

    /**
     * Lấy thống kê audit log
     */
    @GetMapping("/statistics")
    @RequirePermission(feature = "AUDITLOG", action = "VIEW")
    @Operation(summary = "Lấy thống kê audit log", description = "Yêu cầu quyền AUDITLOG_VIEW")
    public ResponseEntity<ApiResponse<AuditLogService.AuditLogStatistics>> getStatistics(
            @Parameter(description = "Từ ngày (ISO DateTime)")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            
            @Parameter(description = "Đến ngày (ISO DateTime)")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        
        AuditLogService.AuditLogStatistics stats;
        if (tuNgay != null || denNgay != null) {
            stats = auditLogService.getStatistics(tuNgay, denNgay);
        } else {
            stats = auditLogService.getStatistics();
        }
        return ResponseEntity.ok(ApiResponse.success("Lấy thống kê thành công", stats));
    }

    /**
     * Tạo mới audit log (dùng cho hệ thống tự động ghi log)
     */
    @PostMapping
    @RequirePermission(feature = "AUDITLOG", action = "CREATE")
    @Operation(summary = "Tạo mới audit log", description = "Yêu cầu quyền AUDITLOG_CREATE")
    public ResponseEntity<ApiResponse<AuditLog>> createAuditLog(
            @RequestBody AuditLog auditLog) {
        AuditLog created = auditLogService.createAuditLog(auditLog);
        return ResponseEntity.ok(ApiResponse.success("Tạo audit log thành công", created));
    }

    /**
     * Xóa audit log
     */
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "AUDITLOG", action = "DELETE")
    @Operation(summary = "Xóa audit log", description = "Yêu cầu quyền AUDITLOG_DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteAuditLog(
            @Parameter(description = "ID của audit log")
            @PathVariable Long id) {
        auditLogService.deleteAuditLog(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa audit log thành công", null));
    }

    /**
     * Export audit log ra PDF
     */
    @GetMapping("/export-pdf")
    @RequirePermission(feature = "AUDITLOG", action = "VIEW")
    @Operation(summary = "Export audit log ra PDF", description = "Yêu cầu quyền AUDITLOG_VIEW")
    public ResponseEntity<byte[]> exportToPdf(
            @Parameter(description = "Loại thao tác")
            @RequestParam(required = false) String loaiThaoTac,
            
            @Parameter(description = "Bảng ảnh hưởng")
            @RequestParam(required = false) String bangAnhHuong,
            
            @Parameter(description = "Loại tài khoản (ADMIN, CUSTOMER)")
            @RequestParam(required = false) String loaiTaiKhoan,
            
            @Parameter(description = "Từ ngày (ISO DateTime)")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            
            @Parameter(description = "Đến ngày (ISO DateTime)")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay,
            
            @Parameter(description = "Từ khóa tìm kiếm")
            @RequestParam(required = false) String search) {
        
        try {
            byte[] pdfBytes = auditLogService.exportToPdf(loaiThaoTac, bangAnhHuong, loaiTaiKhoan, 
                    tuNgay, denNgay, search);
            
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("audit_log_report_%s.pdf", timestamp);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Export audit log ra Excel
     */
    @GetMapping("/export-excel")
    @RequirePermission(feature = "AUDITLOG", action = "VIEW")
    @Operation(summary = "Export audit log ra Excel", description = "Yêu cầu quyền AUDITLOG_VIEW")
    public ResponseEntity<byte[]> exportToExcel(
            @Parameter(description = "Loại thao tác")
            @RequestParam(required = false) String loaiThaoTac,
            
            @Parameter(description = "Bảng ảnh hưởng")
            @RequestParam(required = false) String bangAnhHuong,
            
            @Parameter(description = "Loại tài khoản (ADMIN, CUSTOMER)")
            @RequestParam(required = false) String loaiTaiKhoan,
            
            @Parameter(description = "Từ ngày (ISO DateTime)")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            
            @Parameter(description = "Đến ngày (ISO DateTime)")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay,
            
            @Parameter(description = "Từ khóa tìm kiếm")
            @RequestParam(required = false) String search) {
        
        try {
            byte[] excelBytes = auditLogService.exportToExcel(loaiThaoTac, bangAnhHuong, loaiTaiKhoan, 
                    tuNgay, denNgay, search);
            
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("audit_log_report_%s.xlsx", timestamp);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(excelBytes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
