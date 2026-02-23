package com.example.j2ee.service;

import com.example.j2ee.dto.payment.VnPayTransactionLogResponse;
import com.example.j2ee.model.VnPayTransactionLog;
import com.example.j2ee.repository.VnPayTransactionLogRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service cho VnPayTransactionLog (Lịch sử giao dịch VNPay)
 * Xử lý nghiệp vụ liên quan đến logging giao dịch VNPay IPN
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VnPayTransactionLogService {

    private final VnPayTransactionLogRepository vnPayTransactionLogRepository;
    private final ObjectMapper objectMapper;

    /**
     * Lưu transaction log từ VNPay IPN callback
     *
     * @param vnpParams Map chứa các tham số từ VNPay
     * @param processingResult Kết quả xử lý (SUCCESS, FAILED, CANCELLED, DUPLICATE)
     * @param processingMessage Thông báo kết quả xử lý
     * @param ipnUrl URL nhận IPN callback
     * @param httpMethod Phương thức HTTP (GET, POST)
     * @param sourceIp IP nguồn của request
     * @return VnPayTransactionLog đã lưu
     */
    @Transactional
    public VnPayTransactionLog saveTransactionLog(
            Map<String, String> vnpParams,
            String processingResult,
            String processingMessage,
            String ipnUrl,
            String httpMethod,
            String sourceIp) {

        try {
            // Convert params to JSON for raw_data column
            String rawData = objectMapper.writeValueAsString(vnpParams);

            VnPayTransactionLog log = new VnPayTransactionLog();
            log.setVnpTxnRef(vnpParams.get("vnp_TxnRef"));
            log.setVnpTransactionNo(vnpParams.get("vnp_TransactionNo"));
            log.setVnpAmount(parseSafeLong(vnpParams.get("vnp_Amount")));
            log.setVnpResponseCode(vnpParams.get("vnp_ResponseCode"));
            log.setVnpTransactionStatus(vnpParams.get("vnp_TransactionStatus"));
            log.setVnpBankCode(vnpParams.get("vnp_BankCode"));
            log.setVnpBankTranNo(vnpParams.get("vnp_BankTranNo"));
            log.setVnpPayDate(vnpParams.get("vnp_PayDate"));
            log.setVnpOrderInfo(vnpParams.get("vnp_OrderInfo"));
            log.setVnpSecureHash(vnpParams.get("vnp_SecureHash"));
            log.setIpnUrl(ipnUrl);
            log.setIpnReceivedAt(LocalDateTime.now());
            log.setHttpMethod(httpMethod);
            log.setSourceIp(sourceIp);
            log.setProcessingResult(processingResult);
            log.setProcessingMessage(processingMessage);
            log.setRawData(rawData);
            log.setCreatedAt(LocalDateTime.now());

            VnPayTransactionLog saved = vnPayTransactionLogRepository.save(log);
            log.debug("Đã lưu transaction log: vnpTxnRef={}, result={}",
                    vnpParams.get("vnp_TxnRef"), processingResult);
            return saved;

        } catch (JsonProcessingException e) {
            log.error("Lỗi khi chuyển đổi vnpParams sang JSON: {}", e.getMessage());
            throw new RuntimeException("Không thể lưu transaction log", e);
        }
    }

    /**
     * Tìm kiếm transaction log với nhiều điều kiện lọc và phân trang
     *
     * @param vnpTxnRef Mã giao dịch VNPay (tìm kiếm chứa)
     * @param vnpTransactionNo Số transaction VNPay (tìm kiếm chứa)
     * @param vnpBankCode Mã ngân hàng
     * @param processingResult Kết quả xử lý (SUCCESS, FAILED, CANCELLED, DUPLICATE)
     * @param tuNgay Ngày bắt đầu lọc
     * @param denNgay Ngày kết thúc lọc
     * @param pageable Thông tin phân trang
     * @return Page chứa các DTO response
     */
    public Page<VnPayTransactionLogResponse> searchTransactionLogs(
            String vnpTxnRef,
            String vnpTransactionNo,
            String vnpBankCode,
            String processingResult,
            LocalDateTime tuNgay,
            LocalDateTime denNgay,
            Pageable pageable) {

        Page<VnPayTransactionLog> entityPage = vnPayTransactionLogRepository.searchTransactionLogs(
                vnpTxnRef, vnpTransactionNo, vnpBankCode, processingResult, tuNgay, denNgay, pageable);

        return entityPage.map(this::convertToResponse);
    }

    /**
     * Lấy chi tiết transaction log theo ID
     *
     * @param id ID của transaction log
     * @return DTO response
     */
    public VnPayTransactionLogResponse getTransactionLogById(Long id) {
        VnPayTransactionLog log = vnPayTransactionLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy transaction log với ID: " + id));
        return convertToResponse(log);
    }

    /**
     * Lấy danh sách transaction logs theo vnpTxnRef
     *
     * @param vnpTxnRef Mã giao dịch VNPay
     * @return Danh sách DTO response
     */
    public List<VnPayTransactionLogResponse> getTransactionLogsByTxnRef(String vnpTxnRef) {
        List<VnPayTransactionLog> logs = vnPayTransactionLogRepository.findByVnpTxnRefOrderByIpnReceivedAtDesc(vnpTxnRef);
        return logs.stream()
                .map(this::convertToResponse)
                .toList();
    }

    /**
     * Lấy danh sách các mã ngân hàng distinct
     *
     * @return Danh sách mã ngân hàng
     */
    public List<String> getDistinctBankCodes() {
        return vnPayTransactionLogRepository.findDistinctVnpBankCode();
    }

    /**
     * Lấy thống kê transaction logs
     *
     * @param tuNgay Ngày bắt đầu lọc (null = từ đầu)
     * @param denNgay Ngày kết thúc lọc (null = đến hiện tại)
     * @return Map chứa các số liệu thống kê
     */
    public Map<String, Object> getStatistics(LocalDateTime tuNgay, LocalDateTime denNgay) {
        // Nếu không có ngày, lấy thống kê tất cả
        LocalDateTime startDate = tuNgay != null ? tuNgay : LocalDateTime.now().minusYears(1);
        LocalDateTime endDate = denNgay != null ? denNgay : LocalDateTime.now();

        // Lấy thống kê theo processing result trong khoảng thời gian
        List<Object[]> resultStats = vnPayTransactionLogRepository.countByProcessingResultAndDateRange(
                startDate, endDate);

        Map<String, Long> statsMap = new HashMap<>();
        statsMap.put("SUCCESS", 0L);
        statsMap.put("FAILED", 0L);
        statsMap.put("CANCELLED", 0L);
        statsMap.put("DUPLICATE", 0L);

        long total = 0;
        for (Object[] row : resultStats) {
            String result = (String) row[0];
            Long count = (Long) row[1];
            statsMap.put(result, count);
            total += count;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("total", total);
        response.put("success", statsMap.getOrDefault("SUCCESS", 0L));
        response.put("failed", statsMap.getOrDefault("FAILED", 0L));
        response.put("cancelled", statsMap.getOrDefault("CANCELLED", 0L));
        response.put("duplicate", statsMap.getOrDefault("DUPLICATE", 0L));

        // Thêm thống kê ngày hôm nay
        long todayCount = vnPayTransactionLogRepository.countTodayLogs();
        response.put("today", todayCount);

        return response;
    }

    /**
     * Kiểm tra xem vnpTxnRef đã tồn tại chưa (dùng để detect duplicate)
     *
     * @param vnpTxnRef Mã giao dịch VNPay
     * @return true nếu đã tồn tại, false nếu chưa
     */
    public boolean existsByVnpTxnRef(String vnpTxnRef) {
        return vnPayTransactionLogRepository.existsByVnpTxnRef(vnpTxnRef);
    }

    /**
     * Lấy transaction log gần nhất theo vnpTxnRef
     *
     * @param vnpTxnRef Mã giao dịch VNPay
     * @return Transaction log gần nhất hoặc null nếu không tìm thấy
     */
    public VnPayTransactionLog getLatestTransactionLog(String vnpTxnRef) {
        List<VnPayTransactionLog> logs = vnPayTransactionLogRepository
                .findByVnpTxnRefOrderByIpnReceivedAtDesc(vnpTxnRef);
        return logs.isEmpty() ? null : logs.get(0);
    }

    /**
     * Xóa transaction log theo ID
     *
     * @param id ID của transaction log
     */
    @Transactional
    public void deleteTransactionLog(Long id) {
        if (!vnPayTransactionLogRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy transaction log với ID: " + id);
        }
        vnPayTransactionLogRepository.deleteById(id);
        log.debug("Đã xóa transaction log ID: {}", id);
    }

    /**
     * Chuyển đổi Entity sang DTO Response
     *
     * @param entity Entity VnPayTransactionLog
     * @return DTO VnPayTransactionLogResponse
     */
    private VnPayTransactionLogResponse convertToResponse(VnPayTransactionLog entity) {
        return VnPayTransactionLogResponse.builder()
                .id(entity.getId())
                .vnpTxnRef(entity.getVnpTxnRef())
                .vnpTransactionNo(entity.getVnpTransactionNo())
                .vnpAmount(entity.getVnpAmount())
                .vnpResponseCode(entity.getVnpResponseCode())
                .vnpTransactionStatus(entity.getVnpTransactionStatus())
                .vnpBankCode(entity.getVnpBankCode())
                .vnpBankTranNo(entity.getVnpBankTranNo())
                .vnpPayDate(entity.getVnpPayDate())
                .vnpOrderInfo(entity.getVnpOrderInfo())
                .ipnUrl(entity.getIpnUrl())
                .ipnReceivedAt(entity.getIpnReceivedAt())
                .httpMethod(entity.getHttpMethod())
                .sourceIp(entity.getSourceIp())
                .processingResult(entity.getProcessingResult())
                .processingMessage(entity.getProcessingMessage())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    /**
     * Parse Long an toàn, trả về 0 nếu null hoặc parse lỗi
     *
     * @param value Chuỗi số
     * @return Giá trị Long hoặc 0
     */
    private Long parseSafeLong(String value) {
        if (value == null || value.isEmpty()) {
            return 0L;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            log.warn("Không thể parse Long từ: {}", value);
            return 0L;
        }
    }
}
