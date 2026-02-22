package com.example.j2ee.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "vnpay_transaction_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VnPayTransactionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "vnp_txn_ref", nullable = false, length = 100)
    private String vnpTxnRef;

    @Column(name = "vnp_transaction_no", length = 50)
    private String vnpTransactionNo;

    @Column(name = "vnp_amount", nullable = false)
    private Long vnpAmount;

    @Column(name = "vnp_response_code", length = 10)
    private String vnpResponseCode;

    @Column(name = "vnp_transaction_status", length = 10)
    private String vnpTransactionStatus;

    @Column(name = "vnp_bank_code", length = 20)
    private String vnpBankCode;

    @Column(name = "vnp_bank_tran_no", length = 50)
    private String vnpBankTranNo;

    @Column(name = "vnp_pay_date", length = 20)
    private String vnpPayDate;

    @Column(name = "vnp_order_info", columnDefinition = "TEXT")
    private String vnpOrderInfo;

    @Column(name = "vnp_secure_hash", length = 255)
    private String vnpSecureHash;

    @Column(name = "ipn_url", length = 255)
    private String ipnUrl;

    @Column(name = "ipn_received_at", nullable = false)
    private LocalDateTime ipnReceivedAt;

    @Column(name = "http_method", length = 10)
    private String httpMethod;

    @Column(name = "source_ip", length = 50)
    private String sourceIp;

    @Column(name = "processing_result", nullable = false, length = 20)
    private String processingResult;

    @Column(name = "processing_message", columnDefinition = "TEXT")
    private String processingMessage;

    @Column(name = "raw_data", columnDefinition = "JSON")
    private String rawData;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
