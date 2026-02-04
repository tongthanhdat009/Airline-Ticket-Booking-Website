package com.example.j2ee.controller.internal.marketing;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.AuditLog;
import com.example.j2ee.service.AuditLogService;
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
 * Internal API Controller for Audit Log Management
 * Base URL: /internal/audit-logs
 * 
 * Provides internal/admin APIs for audit log management.
 * JWT Authentication Required.
 */
@RestController
@RequestMapping("/internal/audit-logs")
public class AuditLogInternalController {

    private final AuditLogService auditLogService;

    public AuditLogInternalController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    // ==================== READ ENDPOINTS ====================

    /**
     * GET /internal/audit-logs - Get all audit logs with pagination and search
     */
    @GetMapping
    @RequirePermission(feature = "AUDITLOG", action = "VIEW")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String loaiThaoTac,
            @RequestParam(required = false) String bangAnhHuong,
            @RequestParam(required = false) String loaiTaiKhoan,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay,
            @RequestParam(required = false) String search) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("thoiGian").descending());
        Page<AuditLog> logs = auditLogService.searchAuditLogs(
                loaiThaoTac, bangAnhHuong, loaiTaiKhoan, tuNgay, denNgay, search, pageable);

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách audit log thành công", logs));
    }

    /**
     * GET /internal/audit-logs/{id} - Get audit log by ID
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "AUDITLOG", action = "VIEW")
    public ResponseEntity<ApiResponse<AuditLog>> getAuditLogById(@PathVariable Long id) {
        AuditLog log = auditLogService.getAuditLogById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết audit log thành công", log));
    }

    /**
     * GET /internal/audit-logs/action-types - Get list of action types
     */
    @GetMapping("/action-types")
    @RequirePermission(feature = "AUDITLOG", action = "VIEW")
    public ResponseEntity<ApiResponse<List<String>>> getActionTypes() {
        List<String> list = auditLogService.getLoaiThaoTacList();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách loại thao tác thành công", list));
    }

    /**
     * GET /internal/audit-logs/affected-tables - Get list of affected tables
     */
    @GetMapping("/affected-tables")
    @RequirePermission(feature = "AUDITLOG", action = "VIEW")
    public ResponseEntity<ApiResponse<List<String>>> getAffectedTables() {
        List<String> list = auditLogService.getBangAnhHuongList();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bảng ảnh hưởng thành công", list));
    }

    /**
     * GET /internal/audit-logs/statistics - Get audit log statistics
     */
    @GetMapping("/statistics")
    @RequirePermission(feature = "AUDITLOG", action = "VIEW")
    public ResponseEntity<ApiResponse<AuditLogService.AuditLogStatistics>> getStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        
        AuditLogService.AuditLogStatistics stats;
        if (tuNgay != null || denNgay != null) {
            stats = auditLogService.getStatistics(tuNgay, denNgay);
        } else {
            stats = auditLogService.getStatistics();
        }
        return ResponseEntity.ok(ApiResponse.success("Lấy thống kê thành công", stats));
    }

    // ==================== CREATE ENDPOINTS ====================

    /**
     * POST /internal/audit-logs - Create new audit log (for system auto-logging)
     */
    @PostMapping
    @RequirePermission(feature = "AUDITLOG", action = "CREATE")
    public ResponseEntity<ApiResponse<AuditLog>> createAuditLog(@RequestBody AuditLog auditLog) {
        AuditLog created = auditLogService.createAuditLog(auditLog);
        return ResponseEntity.ok(ApiResponse.success("Tạo audit log thành công", created));
    }

    // ==================== DELETE ENDPOINTS ====================

    /**
     * DELETE /internal/audit-logs/{id} - Delete audit log
     */
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "AUDITLOG", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteAuditLog(@PathVariable Long id) {
        auditLogService.deleteAuditLog(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa audit log thành công", null));
    }

    // ==================== EXPORT ENDPOINTS ====================

    /**
     * GET /internal/audit-logs/export/pdf - Export audit logs as PDF
     */
    @GetMapping("/export/pdf")
    @RequirePermission(feature = "AUDITLOG", action = "VIEW")
    public ResponseEntity<byte[]> exportToPdf(
            @RequestParam(required = false) String loaiThaoTac,
            @RequestParam(required = false) String bangAnhHuong,
            @RequestParam(required = false) String loaiTaiKhoan,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay,
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
     * GET /internal/audit-logs/export/excel - Export audit logs as Excel
     */
    @GetMapping("/export/excel")
    @RequirePermission(feature = "AUDITLOG", action = "VIEW")
    public ResponseEntity<byte[]> exportToExcel(
            @RequestParam(required = false) String loaiThaoTac,
            @RequestParam(required = false) String bangAnhHuong,
            @RequestParam(required = false) String loaiTaiKhoan,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay,
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
