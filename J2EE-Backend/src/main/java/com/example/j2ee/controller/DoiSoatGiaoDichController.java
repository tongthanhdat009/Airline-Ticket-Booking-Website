package com.example.j2ee.controller;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.doi_soat.DoiSoatDetailResponse;
import com.example.j2ee.dto.doi_soat.DoiSoatResponse;
import com.example.j2ee.dto.doi_soat.RunReconciliationRequest;
import com.example.j2ee.dto.doi_soat.UpdateReconciliationNoteRequest;
import com.example.j2ee.model.VnPayTransactionLog;
import com.example.j2ee.service.DoiSoatGiaoDichService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST Controller for DoiSoatGiaoDich - Transaction Reconciliation
 * Base URL: /admin/dashboard/doisuatgiaoDich
 *
 * Provides endpoints for:
 * - Listing transaction reconciliations with filters and sorting
 * - Viewing reconciliation details for a specific invoice
 * - Getting reconciliation statistics
 * - Updating reconciliation notes
 * - Running manual reconciliation
 * - Getting VNPay transaction logs
 * - Exporting reconciliation reports
 *
 * Transaction reconciliation compares invoice amounts (HoaDon.tongThanhToan)
 * with VNPAY payment amounts (TrangThaiThanhToan.soTien) to identify
 * matched and unmatched transactions.
 */
@Slf4j
@RestController
@RequestMapping("/admin/dashboard/doisuatgiaoDich")
public class DoiSoatGiaoDichController {

    private final DoiSoatGiaoDichService doiSoatGiaoDichService;

    /**
     * Constructor injection
     */
    public DoiSoatGiaoDichController(DoiSoatGiaoDichService doiSoatGiaoDichService) {
        this.doiSoatGiaoDichService = doiSoatGiaoDichService;
    }

    // ==================== LIST RECONCILIATIONS ENDPOINT ====================

    /**
     * GET /doisuatgiaoDich - List transaction reconciliations with optional filters and sorting
     *
     * Query Parameters (all optional):
     * - search: Search by invoice number, PNR, customer name or email
     * - trangThai: Filter by invoice status (DA_PHAT_HANH, DA_HUY, DIEU_CHINH)
     * - tuNgay: Filter by invoice date from (ISO-8601 format: yyyy-MM-dd)
     * - denNgay: Filter by invoice date to (ISO-8601 format: yyyy-MM-dd)
     * - sort: Sort by field (ngayLap, tongThanhToan, trangThai, soHoaDon) with
     * optional direction
     * Default sort: ngayLap:desc
     *
     * @return List of reconciliation records matching the filter criteria
     */
    @GetMapping
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<ApiResponse<List<DoiSoatResponse>>> getAllReconciliations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay,
            @RequestParam(required = false) String sort) {
        try {
            List<DoiSoatResponse> doiSoatList = doiSoatGiaoDichService.getAllReconciliations(
                    search,
                    trangThai,
                    tuNgay,
                    denNgay,
                    sort);
            return ResponseEntity.ok(ApiResponse.success(doiSoatList));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách đối soát giao dịch: " + e.getMessage()));
        }
    }

    // ==================== SINGLE RECONCILIATION ENDPOINT ====================

    /**
     * GET /doisuatgiaoDich/{id} - Get reconciliation details by invoice ID
     *
     * Retrieves complete reconciliation details including:
     * - Invoice information (invoice number, PNR, amounts, status)
     * - VNPAY transaction details (transaction ID, amounts, status, pay date)
     * - Reconciliation status (MATCHED/UNMATCHED, amount difference)
     * - Customer information (name, email, phone)
     *
     * @param id Invoice ID (mahoadon)
     * @return Complete reconciliation details with all related data
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<ApiResponse<DoiSoatDetailResponse>> getReconciliationById(@PathVariable Integer id) {
        try {
            DoiSoatDetailResponse doiSoat = doiSoatGiaoDichService.checkReconciliation(id);
            return ResponseEntity.ok(ApiResponse.success(doiSoat));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thông tin đối soát giao dịch: " + e.getMessage()));
        }
    }

    // ==================== STATISTICS ENDPOINT ====================

    /**
     * GET /doisuatgiaoDich/thongke - Get reconciliation statistics
     *
     * Retrieves statistics including:
     * - Total number of transactions
     * - Number of valid transactions (DA_PHAT_HANH)
     * - Number of matched transactions (invoice amount = VNPAY amount)
     * - Number of unmatched transactions (amounts differ)
     * - Total invoice amount
     * - Total VNPAY amount
     * - Difference amount (invoice total - VNPAY total)
     *
     * @return Reconciliation statistics DTO
     */
    @GetMapping("/thongke")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<DoiSoatGiaoDichService.DoiSoatThongKeDTO>> getReconciliationStatistics() {
        try {
            DoiSoatGiaoDichService.DoiSoatThongKeDTO thongKe = doiSoatGiaoDichService.getReconciliationStatistics();
            return ResponseEntity.ok(ApiResponse.success(thongKe));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thống kê đối soát giao dịch: " + e.getMessage()));
        }
    }

    // ==================== UPDATE RECONCILIATION NOTE ENDPOINT ====================

    /**
     * POST /doisuatgiaoDich/{id}/ghichu - Update reconciliation note
     *
     * Cập nhật ghi chú xử lý cho một hóa đơn đối soát
     *
     * @param id Invoice ID (mahoadon)
     * @param Request containing ghiChu and nguoiXuLy
     * @return Success response
     */
    @PostMapping("/{id}/ghichu")
    @RequirePermission(feature = "ORDER", action = "UPDATE")
    public ResponseEntity<ApiResponse<Void>> updateReconciliationNote(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateReconciliationNoteRequest request) {
        try {
            doiSoatGiaoDichService.updateReconciliationNote(id, request);
            return ResponseEntity.ok(ApiResponse.successMessage("Đã cập nhật ghi chú đối soát thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi cập nhật ghi chú đối soát: " + e.getMessage()));
        }
    }

    // ==================== RUN MANUAL RECONCILIATION ENDPOINT ====================

    /**
     * POST /doisuatgiaoDich/chay-doi-soat - Run manual reconciliation
     *
     * Chạy đối soát thủ công cho một khoảng thời gian
     *
     * @param Request containing tuNgay, denNgay, includeMatched
     * @return List of reconciliation results
     */
    @PostMapping("/chay-doi-soat")
    @RequirePermission(feature = "ORDER", action = "UPDATE")
    public ResponseEntity<ApiResponse<List<DoiSoatResponse>>> runManualReconciliation(
            @Valid @RequestBody RunReconciliationRequest request) {
        try {
            List<DoiSoatResponse> results = doiSoatGiaoDichService.runManualReconciliation(request);
            return ResponseEntity.ok(ApiResponse.success(
                    String.format("Đối soát hoàn tất. Tìm thấy %d giao dịch.", results.size()), results));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi chạy đối soát: " + e.getMessage()));
        }
    }

    // ==================== GET VNPAY LOGS ENDPOINT ====================

    /**
     * GET /doisuatgiaoDich/vnpay-log/{txnRef} - Get VNPay transaction logs
     *
     * Lấy danh sách logs từ VNPay theo mã giao dịch
     *
     * @param txnRef VNPay transaction reference
     * @return List of VNPay transaction logs
     */
    @GetMapping("/vnpay-log/{txnRef}")
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<ApiResponse<List<VnPayTransactionLog>>> getVNPayLogs(@PathVariable String txnRef) {
        try {
            List<VnPayTransactionLog> logs = doiSoatGiaoDichService.getVNPayLogsByTxnRef(txnRef);
            return ResponseEntity.ok(ApiResponse.success(logs));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy logs VNPay: " + e.getMessage()));
        }
    }

    // ==================== GET PENDING RECONCILIATIONS ENDPOINT ====================

    /**
     * GET /doisuatgiaoDich/pending - Get pending reconciliations
     *
     * Lấy danh sách các hóa đơn đang chờ xử lý đối soát (trangthai_doisoat = PENDING)
     *
     * @return List of pending reconciliations
     */
    @GetMapping("/pending")
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<ApiResponse<List<DoiSoatResponse>>> getPendingReconciliations() {
        try {
            List<DoiSoatResponse> results = doiSoatGiaoDichService.getPendingReconciliations();
            return ResponseEntity.ok(ApiResponse.success(results));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách chờ xử lý: " + e.getMessage()));
        }
    }

    // ==================== EXPORT REPORT ENDPOINT ====================

    /**
     * GET /doisuatgiaoDich/xuat-bao-cao - Export reconciliation report
     *
     * Xuất báo cáo đối soát ra file Excel
     *
     * @param tuNgay Từ ngày (ISO-8601 format: yyyy-MM-dd)
     * @param denNgay Đến ngày (ISO-8601 format: yyyy-MM-dd)
     * @return File Excel báo cáo đối soát
     */
    @GetMapping("/xuat-bao-cao")
    @RequirePermission(feature = "REPORT", action = "VIEW")
    public ResponseEntity<byte[]> exportReconciliationReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay) {
        try {
            byte[] excelBytes = doiSoatGiaoDichService.exportReconciliationReport(tuNgay, denNgay);

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment",
                    String.format("doi-soat-giao-dich_%s_den_%s.xlsx", tuNgay, denNgay));

            return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Lỗi khi xuất báo cáo: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Lỗi khi xuất báo cáo: " + e.getMessage()).getBytes());
        }
    }
}
