package com.example.j2ee.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VNPayPaymentRequest {
    private int maThanhToan;
    private BigDecimal soTien;
    private String orderInfo;
    private String returnUrl;
}
