package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.ThongKeDichVuDTO;
import com.example.j2ee.dto.ThongKeDoanhThuNgayDTO;
import com.example.j2ee.dto.ThongKeHangVeDTO;
import com.example.j2ee.dto.ThongKeNgayDTO;
import com.example.j2ee.dto.ThongKeSoSanhDTO;
import com.example.j2ee.dto.ThongKeTongQuanDTO;
import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.service.JasperRevenueReportService;
import com.example.j2ee.service.ThongKeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/admin/dashboard/thongke")
public class ThongKeController {

    private final ThongKeService thongKeService;
    private final JasperRevenueReportService jasperRevenueReportService;

    @Autowired
    public ThongKeController(ThongKeService thongKeService, @Lazy JasperRevenueReportService jasperRevenueReportService) {
        this.thongKeService = thongKeService;
        this.jasperRevenueReportService = jasperRevenueReportService;
    }

    /**
     * GET: /admin/dashboard/thongke/tongquan
     * Lấy thống kê tổng quan (KPI cards)
     * 
     * @param startDate Ngày bắt đầu (optional, mặc định 7 ngày trước)
     * @param endDate   Ngày kết thúc (optional, mặc định hôm nay)
     */
    @GetMapping("/tongquan")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<ThongKeTongQuanDTO>> getThongKeTongQuan(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            // Nếu không có tham số, mặc định lấy 7 ngày qua
            if (startDate == null) {
                startDate = LocalDate.now().minusDays(6);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }

            ThongKeTongQuanDTO data = thongKeService.getThongKeTongQuan(startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success("Lấy thống kê tổng quan thành công", data));
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Lỗi khi lấy thống kê tổng quan: " + ex.getMessage()));
        }
    }

    /**
     * GET: /admin/dashboard/thongke/doanhthu-ngay
     * Lấy xu hướng doanh thu theo ngày (Line chart)
     * 
     * @param startDate Ngày bắt đầu (optional, mặc định 7 ngày trước)
     * @param endDate   Ngày kết thúc (optional, mặc định hôm nay)
     */
    @GetMapping("/doanhthu-ngay")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ThongKeDoanhThuNgayDTO>>> getDoanhThuTheoNgay(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            // Nếu không có tham số, mặc định lấy 7 ngày qua
            if (startDate == null) {
                startDate = LocalDate.now().minusDays(6);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }

            List<ThongKeDoanhThuNgayDTO> data = thongKeService.getDoanhThuTheoNgay(startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success("Lấy xu hướng doanh thu thành công", data));
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Lỗi khi lấy xu hướng doanh thu: " + ex.getMessage()));
        }
    }

    /**
     * GET: /admin/dashboard/thongke/doanhthu-dichvu
     * Lấy cơ cấu doanh thu dịch vụ (Bar chart)
     * 
     * @param startDate Ngày bắt đầu (optional, mặc định 7 ngày trước)
     * @param endDate   Ngày kết thúc (optional, mặc định hôm nay)
     */
    @GetMapping("/doanhthu-dichvu")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ThongKeDichVuDTO>>> getDoanhThuTheoDichVu(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            // Nếu không có tham số, mặc định lấy 7 ngày qua
            if (startDate == null) {
                startDate = LocalDate.now().minusDays(6);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }

            List<ThongKeDichVuDTO> data = thongKeService.getDoanhThuTheoDichVu(startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success("Lấy cơ cấu doanh thu dịch vụ thành công", data));
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Lỗi khi lấy cơ cấu doanh thu dịch vụ: " + ex.getMessage()));
        }
    }

    /**
     * GET: /admin/dashboard/thongke/doanhthu-hangve
     * Lấy cơ cấu doanh thu theo hạng vé (Pie chart)
     * 
     * @param startDate Ngày bắt đầu (optional, mặc định 7 ngày trước)
     * @param endDate   Ngày kết thúc (optional, mặc định hôm nay)
     */
    @GetMapping("/doanhthu-hangve")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ThongKeHangVeDTO>>> getDoanhThuTheoHangVe(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            // Nếu không có tham số, mặc định lấy 7 ngày qua
            if (startDate == null) {
                startDate = LocalDate.now().minusDays(6);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }

            List<ThongKeHangVeDTO> data = thongKeService.getDoanhThuTheoHangVe(startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success("Lấy cơ cấu doanh thu hạng vé thành công", data));
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Lỗi khi lấy cơ cấu doanh thu hạng vé: " + ex.getMessage()));
        }
    }

    /**
     * GET: /admin/dashboard/thongke/trong-ngay
     * Lấy thống kê trong ngày hôm nay
     */
    @GetMapping("/trong-ngay")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<ThongKeNgayDTO>> getThongKeTrongNgay() {
        try {
            ThongKeNgayDTO data = thongKeService.getThongKeNgay();
            return ResponseEntity.ok(ApiResponse.success("Lấy thống kê trong ngày thành công", data));
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Lỗi khi lấy thống kê trong ngày: " + ex.getMessage()));
        }
    }

    /**
     * GET: /admin/dashboard/thongke/so-sanh
     * Lấy thống kê so sánh giữa các kỳ
     * 
     * @param tuNgay  Ngày bắt đầu (required)
     * @param denNgay Ngày kết thúc (required)
     * @param kyTruoc Kỳ so sánh: WEEK, MONTH, YEAR (mặc định WEEK)
     */
    @GetMapping("/so-sanh")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<ThongKeSoSanhDTO>> getThongKeSoSanh(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay,
            @RequestParam(required = false, defaultValue = "WEEK") String kyTruoc) {
        try {
            ThongKeSoSanhDTO data = thongKeService.getThongKeSoSanh(tuNgay, denNgay, kyTruoc);
            return ResponseEntity.ok(ApiResponse.success("Lấy thống kê so sánh thành công", data));
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Lỗi khi lấy thống kê so sánh: " + ex.getMessage()));
        }
    }

    /**
     * GET: /admin/dashboard/thongke/export-pdf
     * Xuất báo cáo thống kê doanh thu ra file PDF sử dụng JasperReports
     * 
     * @param startDate Ngày bắt đầu (optional)
     * @param endDate   Ngày kết thúc (optional)
     */
    @GetMapping("/export-pdf")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<byte[]> exportStatisticsToPdf(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            // Tạo tên file với ngày tháng
            String fileName = "bao-cao-thong-ke-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
                    + ".pdf";

            // Generate PDF sử dụng JasperReports
            byte[] pdfBytes = jasperRevenueReportService.generateRevenueReport(startDate, endDate);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", fileName);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(null);
        }
    }
}
