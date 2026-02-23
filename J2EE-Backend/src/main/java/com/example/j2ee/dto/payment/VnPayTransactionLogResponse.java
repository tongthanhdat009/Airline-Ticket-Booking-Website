package com.example.j2ee.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO response cho lịch sử giao dịch VNPay
 * Chứa thông tin chi tiết về giao dịch qua cổng thanh toán VNPay
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VnPayTransactionLogResponse {

    // Thông tin cơ bản
    private Long id;
    private String vnpTxnRef;
    private String vnpTransactionNo;
    private Long vnpAmount;
    private String vnpResponseCode;
    private String vnpTransactionStatus;

    // Thông tin ngân hàng
    private String vnpBankCode;
    private String vnpBankTranNo;
    private String vnpPayDate;

    // Thông tin đơn hàng
    private String vnpOrderInfo;

    // Thông tin IPN callback
    private String ipnUrl;
    private LocalDateTime ipnReceivedAt;
    private String httpMethod;
    private String sourceIp;

    // Kết quả xử lý
    private String processingResult;
    private String processingMessage;

    // Thời gian tạo
    private LocalDateTime createdAt;
}
