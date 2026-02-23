package com.example.j2ee.controller;

import com.example.j2ee.dto.payment.VnPayTransactionLogResponse;
import com.example.j2ee.service.VnPayTransactionLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller cho VnPayTransactionLog (Lịch sử giao dịch VNPay)
 * Cung cấp API endpoints cho việc truy xuất và thống kê giao dịch VNPay
 */
@RestController
@RequestMapping("/vnpay/transaction-logs")
@RequiredArgsConstructor
@Slf4j
public class VnPayTransactionLogController {

    private final VnPayTransactionLogService vnPayTransactionLogService;

    /**
     * Lấy danh sách log giao dịch VNPay với phân trang và bộ lọc
     *
     * @param page Số trang (mặc định 0)
     * @param size Kích thước trang (mặc định 10)
     * @param search Tìm kiếm theo vnp_TxnRef, vnp_TransactionNo, vnp_BankCode
     * @param processingResult Lọc theo kết quả xử lý (SUCCESS, FAILED, CANCELLED, DUPLICATE)
     * @param tuNgay Ngày bắt đầu lọc (định dạng yyyy-MM-dd)
     * @param denNgay Ngày kết thúc lọc (định dạng yyyy-MM-dd)
     * @return ResponseEntity chứa danh sách log giao dịch phân trang
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getTransactionLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String processingResult,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String denNgay) {

        try {
            log.debug("API getTransactionLogs được gọi với params: page={}, size={}, search={}, processingResult={}, tuNgay={}, denNgay={}",
                    page, size, search, processingResult, tuNgay, denNgay);

            // Chuyển đổi định dạng ngày
            LocalDateTime startDate = null;
            LocalDateTime endDate = null;

            if (tuNgay != null && !tuNgay.isEmpty()) {
                startDate = LocalDateTime.parse(tuNgay + "T00:00:00");
            }
            if (denNgay != null && !denNgay.isEmpty()) {
                endDate = LocalDateTime.parse(denNgay + "T23:59:59");
            }

            // Tạo pageable với sắp xếp theo ipnReceivedAt giảm dần
            Pageable pageable = PageRequest.of(page, size, Sort.by("ipnReceivedAt").descending());

            // Gọi service để tìm kiếm
            Page<VnPayTransactionLogResponse> resultPage = vnPayTransactionLogService.searchTransactionLogs(
                    search, search, search, processingResult, startDate, endDate, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy danh sách log giao dịch thành công");
            response.put("data", resultPage);

            log.debug("Trả về {} bản ghi", resultPage.getContent().size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách log giao dịch: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi lấy danh sách log giao dịch: " + e.getMessage());
            errorResponse.put("data", null);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Lấy thống kê log giao dịch VNPay
     *
     * @param tuNgay Ngày bắt đầu lọc (định dạng yyyy-MM-dd,可选)
     * @param denNgay Ngày kết thúc lọc (định dạng yyyy-MM-dd,可选)
     * @return ResponseEntity chứa số liệu thống kê
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String denNgay) {

        try {
            log.debug("API getStatistics được gọi với params: tuNgay={}, denNgay={}", tuNgay, denNgay);

            // Chuyển đổi định dạng ngày
            LocalDateTime startDate = null;
            LocalDateTime endDate = null;

            if (tuNgay != null && !tuNgay.isEmpty()) {
                startDate = LocalDateTime.parse(tuNgay + "T00:00:00");
            }
            if (denNgay != null && !denNgay.isEmpty()) {
                endDate = LocalDateTime.parse(denNgay + "T23:59:59");
            }

            // Gọi service để lấy thống kê
            Map<String, Object> statistics = vnPayTransactionLogService.getStatistics(startDate, endDate);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy thống kê giao dịch thành công");
            response.put("data", statistics);

            log.debug("Thống kê: {}", statistics);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Lỗi khi lấy thống kê giao dịch: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi lấy thống kê giao dịch: " + e.getMessage());
            errorResponse.put("data", null);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Lấy chi tiết log giao dịch theo ID
     *
     * @param id ID của log giao dịch
     * @return ResponseEntity chứa chi tiết log giao dịch
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getTransactionLogById(@PathVariable Long id) {
        try {
            log.debug("API getTransactionLogById được gọi với id={}", id);

            VnPayTransactionLogResponse logResponse = vnPayTransactionLogService.getTransactionLogById(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy chi tiết log giao dịch thành công");
            response.put("data", logResponse);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Lỗi khi lấy chi tiết log giao dịch id={}: {}", id, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            errorResponse.put("data", null);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi lấy chi tiết log giao dịch id={}: {}", id, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi hệ thống: " + e.getMessage());
            errorResponse.put("data", null);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Lấy danh sách log giao dịch theo vnpTxnRef
     *
     * @param vnpTxnRef Mã giao dịch VNPay
     * @return ResponseEntity chứa danh sách log giao dịch
     */
    @GetMapping("/txn/{vnpTxnRef}")
    public ResponseEntity<Map<String, Object>> getTransactionLogsByTxnRef(@PathVariable String vnpTxnRef) {
        try {
            log.debug("API getTransactionLogsByTxnRef được gọi với vnpTxnRef={}", vnpTxnRef);

            List<VnPayTransactionLogResponse> logs = vnPayTransactionLogService.getTransactionLogsByTxnRef(vnpTxnRef);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy danh sách log giao dịch theo mã giao dịch thành công");
            response.put("data", logs);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách log giao dịch theo vnpTxnRef={}: {}", vnpTxnRef, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi lấy danh sách log giao dịch: " + e.getMessage());
            errorResponse.put("data", null);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
