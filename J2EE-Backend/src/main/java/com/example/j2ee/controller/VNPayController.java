package com.example.j2ee.controller;

import com.example.j2ee.dto.payment.VNPayPaymentResponse;
import com.example.j2ee.model.TrangThaiThanhToan;
import com.example.j2ee.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/vnpay")
@RequiredArgsConstructor
public class VNPayController {

    private final VNPayService vnPayService;

    /**
     * Tạo URL thanh toán VNPay
     */
    @PostMapping("/create-payment")
    public ResponseEntity<Map<String, Object>> createPayment(
            @RequestParam int maThanhToan,
            HttpServletRequest request) {
        try {
            String paymentUrl = vnPayService.createPaymentUrl(maThanhToan, request);
            
            VNPayPaymentResponse response = new VNPayPaymentResponse();
            response.setPaymentUrl(paymentUrl);
            response.setMessage("Tạo URL thanh toán thành công");
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Tạo URL thanh toán thành công");
            result.put("data", response);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            errorResponse.put("data", null);
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Xử lý callback từ VNPay và redirect về frontend
     */
    @GetMapping("/payment-callback")
    public void paymentCallback(
            @RequestParam Map<String, String> params,
            HttpServletResponse response) throws IOException {
        
        try {
            Map<String, Object> result = vnPayService.handlePaymentReturn(params);
            
            // Lấy frontend URL từ config
            String frontendUrl = vnPayService.getFrontendUrl();
            
            // Tạo redirect URL với kết quả
            StringBuilder redirectUrl = new StringBuilder(frontendUrl);
            redirectUrl.append("?success=").append(result.get("success"));
            redirectUrl.append("&message=").append(URLEncoder.encode((String) result.get("message"), StandardCharsets.UTF_8));
            
            // Thêm thông tin thanh toán nếu thành công
            if (result.get("data") != null && result.get("data") instanceof TrangThaiThanhToan) {
                TrangThaiThanhToan thanhToan = (TrangThaiThanhToan) result.get("data");
                redirectUrl.append("&maThanhToan=").append(thanhToan.getMaThanhToan());
                redirectUrl.append("&soTien=").append(thanhToan.getSoTien());
            }
            
            // Thêm các params từ VNPay
            if (params.get("vnp_TxnRef") != null) {
                redirectUrl.append("&vnp_TxnRef=").append(URLEncoder.encode(params.get("vnp_TxnRef"), StandardCharsets.UTF_8));
            }
            if (params.get("vnp_ResponseCode") != null) {
                redirectUrl.append("&vnp_ResponseCode=").append(params.get("vnp_ResponseCode"));
            }
            if (params.get("vnp_BankCode") != null) {
                redirectUrl.append("&vnp_BankCode=").append(params.get("vnp_BankCode"));
            }
            if (params.get("vnp_PayDate") != null) {
                redirectUrl.append("&vnp_PayDate=").append(params.get("vnp_PayDate"));
            }
            
            // Redirect về frontend
            response.sendRedirect(redirectUrl.toString());
        } catch (Exception e) {
            // Nếu có lỗi, redirect về frontend với thông báo lỗi
            String frontendUrl = vnPayService.getFrontendUrl();
            String errorUrl = frontendUrl + "?success=false&message=" + 
                URLEncoder.encode("Lỗi xử lý thanh toán: " + e.getMessage(), StandardCharsets.UTF_8);
            response.sendRedirect(errorUrl);
        }
    }

    /**
     * API trả về kết quả thanh toán cho frontend
     * Endpoint này được gọi từ frontend sau khi VNPay redirect về
     */
    @GetMapping("/payment-result")
    public ResponseEntity<Map<String, Object>> getPaymentResult(@RequestParam Map<String, String> params) {
        Map<String, Object> result = vnPayService.handlePaymentReturn(params);
        
        if ((boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }
}
