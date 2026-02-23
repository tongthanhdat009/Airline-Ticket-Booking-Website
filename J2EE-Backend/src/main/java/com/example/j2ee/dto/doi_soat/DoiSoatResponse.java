package com.example.j2ee.dto.doi_soat;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO cho thông tin đối soát giao dịch - response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoiSoatResponse {

    private Integer maHoaDon;
    private String soHoaDon;
    private String pnr;

    private BigDecimal invoiceAmount;
    private BigDecimal vnpayAmount;

    private String status; // MATCHED, UNMATCHED
    private BigDecimal amountDifference;
    private String vnpayTransactionId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime ngayLap;
}
