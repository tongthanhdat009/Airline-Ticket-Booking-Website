package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.ThongKeDichVuDTO;
import com.example.j2ee.dto.ThongKeDoanhThuNgayDTO;
import com.example.j2ee.dto.ThongKeHangVeDTO;
import com.example.j2ee.dto.ThongKeNgayDTO;
import com.example.j2ee.dto.ThongKeSoSanhDTO;
import com.example.j2ee.dto.ThongKeTongQuanDTO;
import com.example.j2ee.dto.ThongKeChangBayDTO;
import com.example.j2ee.dto.ThongKeTrangThaiDonHangDTO;
import com.example.j2ee.dto.ThongKeKhungGioDTO;
import com.example.j2ee.dto.ThongKeTyLeChuyenDoiDTO;
import com.example.j2ee.dto.ThongKeSoSanhCungKyDTO;
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
     */
    @GetMapping("/tongquan")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<ThongKeTongQuanDTO>> getThongKeTongQuan(
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
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Lỗi khi lấy thống kê tổng quan: " + ex.getMessage()));
        }
    }

    /**
     * GET: /admin/dashboard/thongke/doanhthu-ngay
     * Lấy xu hướng doanh thu theo ngày (Line chart)
     */
    @GetMapping("/doanhthu-ngay")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ThongKeDoanhThuNgayDTO>>> getDoanhThuTheoNgay(
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
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Lỗi khi lấy xu hướng doanh thu: " + ex.getMessage()));
        }
    }

    /**
     * GET: /admin/dashboard/thongke/doanhthu-dichvu
     * Lấy cơ cấu doanh thu dịch vụ (Bar chart)
     */
    @GetMapping("/doanhthu-dichvu")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ThongKeDichVuDTO>>> getDoanhThuTheoDichVu(
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
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Lỗi khi lấy cơ cấu doanh thu dịch vụ: " + ex.getMessage()));
        }
    }

    /**
     * GET: /admin/dashboard/thongke/doanhthu-hangve
     * Lấy cơ cấu doanh thu theo hạng vé (Pie chart)
     */
    @GetMapping("/doanhthu-hangve")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ThongKeHangVeDTO>>> getDoanhThuTheoHangVe(
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
     * Xuất báo cáo thống kê doanh thu ra file PDF
     */
    @GetMapping("/export-pdf")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<byte[]> exportStatisticsToPdf(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            String fileName = "bao-cao-thong-ke-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + ".pdf";
            byte[] pdfBytes = jasperRevenueReportService.generateRevenueReport(startDate, endDate);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", fileName);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // ========================================
    // CAC API MOI - BO SUNG
    // ========================================

    /**
     * GET: /admin/dashboard/thongke/top-chang-bay
     * Top chặng bay phổ biến nhất (Horizontal Bar Chart)
     */
    @GetMapping("/top-chang-bay")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ThongKeChangBayDTO>>> getTopChangBay(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "10") int limit) {
        try {
            if (startDate == null) {
                startDate = LocalDate.now().minusDays(29);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }

            List<ThongKeChangBayDTO> data = thongKeService.getTopChangBay(startDate, endDate, limit);
            return ResponseEntity.ok(ApiResponse.success("Lấy top chặng bay thành công", data));
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Lỗi khi lấy top chặng bay: " + ex.getMessage()));
        }
    }

    /**
     * GET: /admin/dashboard/thongke/trang-thai-don-hang
     * Thống kê tỷ lệ trạng thái đơn hàng (Pie Chart)
     */
    @GetMapping("/trang-thai-don-hang")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ThongKeTrangThaiDonHangDTO>>> getThongKeTrangThaiDonHang(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            if (startDate == null) {
                startDate = LocalDate.now().minusDays(29);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }

            List<ThongKeTrangThaiDonHangDTO> data = thongKeService.getThongKeTrangThaiDonHang(startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success("Lấy thống kê trạng thái đơn hàng thành công", data));
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Lỗi khi lấy thống kê trạng thái đơn hàng: " + ex.getMessage()));
        }
    }

    /**
     * GET: /admin/dashboard/thongke/khung-gio
     * Thống kê khung giờ đặt vé cao điểm (Heatmap)
     */
    @GetMapping("/khung-gio")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ThongKeKhungGioDTO>>> getThongKeKhungGio(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            if (startDate == null) {
                startDate = LocalDate.now().minusDays(29);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }

            List<ThongKeKhungGioDTO> data = thongKeService.getThongKeKhungGio(startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success("Lấy thống kê khung giờ thành công", data));
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Lỗi khi lấy thống kê khung giờ: " + ex.getMessage()));
        }
    }

    /**
     * GET: /admin/dashboard/thongke/ty-le-chuyen-doi
     * Thống kê tỷ lệ chuyển đổi đặt vé (Funnel Chart)
     */
    @GetMapping("/ty-le-chuyen-doi")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ThongKeTyLeChuyenDoiDTO>>> getThongKeTyLeChuyenDoi(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            if (startDate == null) {
                startDate = LocalDate.now().minusDays(29);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }

            List<ThongKeTyLeChuyenDoiDTO> data = thongKeService.getThongKeTyLeChuyenDoi(startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success("Lấy thống kê tỷ lệ chuyển đổi thành công", data));
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Lỗi khi lấy thống kê tỷ lệ chuyển đổi: " + ex.getMessage()));
        }
    }

    /**
     * GET: /admin/dashboard/thongke/so-sanh-cung-ky
     * So sánh cùng kỳ (Grouped Bar Chart)
     */
    @GetMapping("/so-sanh-cung-ky")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ThongKeSoSanhCungKyDTO>>> getSoSanhCungKy(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "MONTH") String loaiKy) {
        try {
            if (startDate == null) {
                startDate = LocalDate.now().minusDays(29);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }

            List<ThongKeSoSanhCungKyDTO> data = thongKeService.getSoSanhCungKy(startDate, endDate, loaiKy);
            return ResponseEntity.ok(ApiResponse.success("Lấy thống kê so sánh cùng kỳ thành công", data));
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Lỗi khi lấy thống kê so sánh cùng kỳ: " + ex.getMessage()));
        }
    }
}
