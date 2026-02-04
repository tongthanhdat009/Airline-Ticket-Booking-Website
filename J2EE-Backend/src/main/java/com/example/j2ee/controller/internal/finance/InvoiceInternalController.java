package com.example.j2ee.controller.internal.finance;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.hoadon.*;
import com.example.j2ee.service.ExcelExportService;
import com.example.j2ee.service.HoaDonService;
import com.example.j2ee.service.JasperHoaDonService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Internal API Controller for Invoice Management
 * Base URL: /internal/invoices
 * 
 * Provides internal/admin APIs for invoice management.
 * JWT Authentication Required.
 */
@RestController
@RequestMapping("/internal/invoices")
public class InvoiceInternalController {

    private final HoaDonService hoaDonService;
    private final JasperHoaDonService jasperHoaDonService;
    private final ExcelExportService excelExportService;

    public InvoiceInternalController(HoaDonService hoaDonService,
                                     JasperHoaDonService jasperHoaDonService,
                                     ExcelExportService excelExportService) {
        this.hoaDonService = hoaDonService;
        this.jasperHoaDonService = jasperHoaDonService;
        this.excelExportService = excelExportService;
    }

    // ==================== READ ENDPOINTS ====================

    /**
     * GET /internal/invoices - List invoices with filters
     */
    @GetMapping
    @RequirePermission(feature = "INVOICE", action = "VIEW")
    public ResponseEntity<ApiResponse<List<HoaDonResponse>>> getAllInvoices(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay,
            @RequestParam(required = false) String sort) {
        try {
            List<HoaDonResponse> invoices = hoaDonService.getAllHoaDon(search, trangThai, tuNgay, denNgay, sort);
            return ResponseEntity.ok(ApiResponse.success(invoices));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách hóa đơn: " + e.getMessage()));
        }
    }

    /**
     * GET /internal/invoices/{id} - Get invoice by ID
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<ApiResponse<HoaDonDetailResponse>> getInvoiceById(@PathVariable Integer id) {
        try {
            HoaDonDetailResponse invoice = hoaDonService.getHoaDonById(id);
            return ResponseEntity.ok(ApiResponse.success(invoice));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thông tin hóa đơn: " + e.getMessage()));
        }
    }

    /**
     * GET /internal/invoices/number/{invoiceNumber} - Get invoice by number
     */
    @GetMapping("/number/{invoiceNumber}")
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<ApiResponse<HoaDonDetailResponse>> getInvoiceByNumber(@PathVariable String invoiceNumber) {
        try {
            HoaDonDetailResponse invoice = hoaDonService.getHoaDonBySoHoaDon(invoiceNumber);
            return ResponseEntity.ok(ApiResponse.success(invoice));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi tìm hóa đơn theo số: " + e.getMessage()));
        }
    }

    /**
     * GET /internal/invoices/statistics - Get invoice statistics
     */
    @GetMapping("/statistics")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<HoaDonThongKeDTO>> getStatistics() {
        try {
            HoaDonThongKeDTO statistics = hoaDonService.getThongKe();
            return ResponseEntity.ok(ApiResponse.success(statistics));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thống kê hóa đơn: " + e.getMessage()));
        }
    }

    /**
     * GET /internal/invoices/generate-number - Generate next invoice number
     */
    @GetMapping("/generate-number")
    @RequirePermission(feature = "ORDER", action = "CREATE")
    public ResponseEntity<ApiResponse<String>> generateInvoiceNumber() {
        try {
            String invoiceNumber = hoaDonService.generateSoHoaDon();
            return ResponseEntity.ok(ApiResponse.success(invoiceNumber));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi tạo số hóa đơn: " + e.getMessage()));
        }
    }

    // ==================== CREATE ENDPOINTS ====================

    /**
     * POST /internal/invoices - Create new invoice
     */
    @PostMapping
    @RequirePermission(feature = "ORDER", action = "CREATE")
    public ResponseEntity<ApiResponse<HoaDonResponse>> createInvoice(
            @Valid @RequestBody CreateHoaDonRequest request) {
        try {
            HoaDonResponse invoice = hoaDonService.createHoaDon(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Tạo hóa đơn thành công", invoice));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi tạo hóa đơn: " + e.getMessage()));
        }
    }

    // ==================== UPDATE ENDPOINTS ====================

    /**
     * PUT /internal/invoices/{id} - Update invoice
     */
    @PutMapping("/{id}")
    @RequirePermission(feature = "ORDER", action = "UPDATE")
    public ResponseEntity<ApiResponse<HoaDonResponse>> updateInvoice(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateHoaDonRequest request) {
        try {
            HoaDonResponse invoice = hoaDonService.updateHoaDon(id, request);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật hóa đơn thành công", invoice));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi cập nhật hóa đơn: " + e.getMessage()));
        }
    }

    /**
     * PUT /internal/invoices/{id}/cancel - Cancel invoice
     */
    @PutMapping("/{id}/cancel")
    @RequirePermission(feature = "ORDER", action = "CANCEL")
    public ResponseEntity<ApiResponse<HoaDonResponse>> cancelInvoice(
            @PathVariable Integer id,
            @Valid @RequestBody HuyHoaDonRequest request) {
        try {
            HoaDonResponse invoice = hoaDonService.huyHoaDon(
                    id,
                    request.getLyDoHuy(),
                    request.getNguoiThucHien());
            return ResponseEntity.ok(ApiResponse.success("Hủy hóa đơn thành công", invoice));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi hủy hóa đơn: " + e.getMessage()));
        }
    }

    /**
     * PUT /internal/invoices/{id}/restore - Restore soft-deleted invoice
     */
    @PutMapping("/{id}/restore")
    @RequirePermission(feature = "ORDER", action = "RESTORE")
    public ResponseEntity<ApiResponse<Void>> restoreInvoice(@PathVariable Integer id) {
        try {
            hoaDonService.restoreHoaDon(id);
            return ResponseEntity.ok(ApiResponse.successMessage("Khôi phục hóa đơn thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi khôi phục hóa đơn: " + e.getMessage()));
        }
    }

    // ==================== DELETE ENDPOINTS ====================

    /**
     * DELETE /internal/invoices/{id} - Soft delete invoice
     */
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "ORDER", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteInvoice(@PathVariable Integer id) {
        try {
            hoaDonService.softDeleteHoaDon(id);
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa hóa đơn thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi xóa hóa đơn: " + e.getMessage()));
        }
    }

    // ==================== EXPORT ENDPOINTS ====================

    /**
     * GET /internal/invoices/{id}/pdf - Export invoice as PDF
     */
    @GetMapping("/{id}/pdf")
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<byte[]> exportInvoicePdf(@PathVariable Integer id) {
        try {
            byte[] pdfBytes = jasperHoaDonService.generateHoaDonPdf(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("filename", "hoadon_" + id + ".pdf");
            headers.setContentLength(pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /internal/invoices/excel - Export invoices as Excel
     */
    @GetMapping("/excel")
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<byte[]> exportInvoicesExcel(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay) {
        try {
            List<HoaDonResponse> invoices = hoaDonService.getAllHoaDon(search, trangThai, tuNgay, denNgay, null);
            byte[] excelBytes = excelExportService.exportHoaDonToExcel(invoices);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("filename", "danh_sach_hoa_don.xlsx");
            headers.setContentLength(excelBytes.length);

            return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
