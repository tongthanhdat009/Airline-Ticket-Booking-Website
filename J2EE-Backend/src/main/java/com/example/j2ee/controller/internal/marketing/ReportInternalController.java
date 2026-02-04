package com.example.j2ee.controller.internal.marketing;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.ThongKeDichVuDTO;
import com.example.j2ee.dto.ThongKeDoanhThuNgayDTO;
import com.example.j2ee.dto.ThongKeHangVeDTO;
import com.example.j2ee.dto.ThongKeNgayDTO;
import com.example.j2ee.dto.ThongKeSoSanhDTO;
import com.example.j2ee.dto.ThongKeTongQuanDTO;
import com.example.j2ee.service.JasperRevenueReportService;
import com.example.j2ee.service.ThongKeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Internal API Controller for Reports and Statistics
 * Base URL: /internal/reports
 * 
 * Provides internal/admin APIs for reports and statistics.
 * JWT Authentication Required.
 */
@RestController
@RequestMapping("/internal/reports")
public class ReportInternalController {

    private final ThongKeService thongKeService;
    private final JasperRevenueReportService jasperRevenueReportService;

    @Autowired
    public ReportInternalController(ThongKeService thongKeService, 
                                     @Lazy JasperRevenueReportService jasperRevenueReportService) {
        this.thongKeService = thongKeService;
        this.jasperRevenueReportService = jasperRevenueReportService;
    }

    // ==================== OVERVIEW ENDPOINTS ====================

    /**
     * GET /internal/reports/overview - Get overview statistics (KPI cards)
     */
    @GetMapping("/overview")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<ThongKeTongQuanDTO>> getOverview(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            if (startDate == null) {
                startDate = LocalDate.now().minusDays(6);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }

            ThongKeTongQuanDTO data = thongKeService.getThongKeTongQuan(startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success("Lấy thống kê tổng quan thành công", data));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thống kê tổng quan: " + ex.getMessage()));
        }
    }

    /**
     * GET /internal/reports/today - Get today's statistics
     */
    @GetMapping("/today")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<ThongKeNgayDTO>> getTodayStatistics() {
        try {
            ThongKeNgayDTO data = thongKeService.getThongKeNgay();
            return ResponseEntity.ok(ApiResponse.success("Lấy thống kê trong ngày thành công", data));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thống kê trong ngày: " + ex.getMessage()));
        }
    }

    // ==================== REVENUE ENDPOINTS ====================

    /**
     * GET /internal/reports/revenue/daily - Get daily revenue trend
     */
    @GetMapping("/revenue/daily")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ThongKeDoanhThuNgayDTO>>> getDailyRevenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            if (startDate == null) {
                startDate = LocalDate.now().minusDays(6);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }

            List<ThongKeDoanhThuNgayDTO> data = thongKeService.getDoanhThuTheoNgay(startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success("Lấy xu hướng doanh thu thành công", data));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy xu hướng doanh thu: " + ex.getMessage()));
        }
    }

    /**
     * GET /internal/reports/revenue/by-service - Get revenue by service
     */
    @GetMapping("/revenue/by-service")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ThongKeDichVuDTO>>> getRevenueByService(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            if (startDate == null) {
                startDate = LocalDate.now().minusDays(6);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }

            List<ThongKeDichVuDTO> data = thongKeService.getDoanhThuTheoDichVu(startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success("Lấy cơ cấu doanh thu dịch vụ thành công", data));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy cơ cấu doanh thu dịch vụ: " + ex.getMessage()));
        }
    }

    /**
     * GET /internal/reports/revenue/by-ticket-class - Get revenue by ticket class
     */
    @GetMapping("/revenue/by-ticket-class")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ThongKeHangVeDTO>>> getRevenueByTicketClass(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            if (startDate == null) {
                startDate = LocalDate.now().minusDays(6);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }

            List<ThongKeHangVeDTO> data = thongKeService.getDoanhThuTheoHangVe(startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success("Lấy cơ cấu doanh thu hạng vé thành công", data));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy cơ cấu doanh thu hạng vé: " + ex.getMessage()));
        }
    }

    // ==================== COMPARISON ENDPOINTS ====================

    /**
     * GET /internal/reports/comparison - Get comparison statistics between periods
     */
    @GetMapping("/comparison")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<ThongKeSoSanhDTO>> getComparison(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "WEEK") String period) {
        try {
            ThongKeSoSanhDTO data = thongKeService.getThongKeSoSanh(startDate, endDate, period);
            return ResponseEntity.ok(ApiResponse.success("Lấy thống kê so sánh thành công", data));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thống kê so sánh: " + ex.getMessage()));
        }
    }

    // ==================== EXPORT ENDPOINTS ====================

    /**
     * GET /internal/reports/export/pdf - Export statistics report as PDF
     */
    @GetMapping("/export/pdf")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<byte[]> exportToPdf(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            String fileName = "bao-cao-thong-ke-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
                    + ".pdf";

            byte[] pdfBytes = jasperRevenueReportService.generateRevenueReport(startDate, endDate);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", fileName);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
