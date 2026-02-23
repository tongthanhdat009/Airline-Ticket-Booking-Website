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
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        // GUARD: Ngăn redirect loop - nếu không có vnp_SecureHash thì đây KHÔNG phải request từ VNPay
        // mà là redirect URL bị Nginx route lại vào backend
        if (!params.containsKey("vnp_SecureHash")) {
            System.out.println("=== VNPAY GUARD: Request không có vnp_SecureHash - redirect loop detected ===");
            System.out.println("Query: " + request.getQueryString());
            String frontendUrl = vnPayService.getFrontendUrl();
            // Giữ nguyên query params hiện có, forward cho frontend xử lý
            String queryString = request.getQueryString();
            String redirectUrl = frontendUrl + (queryString != null ? "?" + queryString : "");
            response.sendRedirect(redirectUrl);
            return;
        }

        try {
            Map<String, Object> result = vnPayService.handlePaymentReturn(params, request);
            
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
    public ResponseEntity<Map<String, Object>> getPaymentResult(
            @RequestParam Map<String, String> params,
            HttpServletRequest request) {
        Map<String, Object> result = vnPayService.handlePaymentReturn(params, request);
        
        if ((boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * IPN (Instant Payment Notification) Endpoint
     * VNPay gọi endpoint này server-to-server để confirm kết quả giao dịch
     * 
     * Lưu ý quan trọng:
     * - Endpoint này PHẢI là public (không cần authentication)
     * - PHẢI trả về plain text "00" cho success, "97" cho invalid signature, "99" cho error
     * - KHÔNG redirect, KHÔNG trả JSON
     * 
     * URL cấu hình trên VNPay: https://jadt-airline.io.vn/api/vnpay/ipn
     */
    @GetMapping("/ipn")
    public ResponseEntity<String> handleIPN(
            @RequestParam Map<String, String> params,
            HttpServletRequest request) {
        
        try {
            // Gọi service xử lý IPN
            Map<String, Object> result = vnPayService.handleIPN(params, request);
            
            // Trả về mã theo chuẩn VNPay
            String responseCode = (String) result.get("responseCode");
            return ResponseEntity.ok(responseCode);
            
        } catch (Exception e) {
            // Log lỗi và trả về mã lỗi
            return ResponseEntity.ok("99"); // Unknown error
        }
    }
}
