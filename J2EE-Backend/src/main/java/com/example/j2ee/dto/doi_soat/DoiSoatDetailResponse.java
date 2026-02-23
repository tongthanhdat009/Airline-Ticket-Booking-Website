package com.example.j2ee.dto.doi_soat;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO cho chi tiết đối soát giao dịch - response chi tiết đầy đủ
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoiSoatDetailResponse {

    // Thông tin hóa đơn
    private Integer maHoaDon;
    private String soHoaDon;
    private String pnr;

    // Số tiền đối soát
    private BigDecimal invoiceAmount;
    private BigDecimal vnpayAmount;

    // Trạng thái đối soát
    private String status; // MATCHED, UNMATCHED
    private BigDecimal amountDifference;
    private String vnpayTransactionId;

    // Thời gian
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime ngayLap;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    // Thông tin chi tiết VNPAY
    private String vnpayResponseCode;
    private String vnpayTransactionStatus;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime vnpayPayDate;

    // Thông tin hóa đơn chi tiết
    private String emailNguoiDat;
    private String soDienThoaiNguoiDat;
    private String hoTenNguoiDat;
    private String trangThaiHoaDon;
}
