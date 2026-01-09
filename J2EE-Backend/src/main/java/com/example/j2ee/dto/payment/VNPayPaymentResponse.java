package com.example.j2ee.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VNPayPaymentResponse {
    private String paymentUrl;
    private String message;
}
