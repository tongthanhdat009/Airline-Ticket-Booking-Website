package com.example.j2ee.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class VNPayConfig {
    
    @Value("${vnpay.tmnCode}")
    private String tmnCode;
    
    @Value("${vnpay.secretKey}")
    private String secretKey;
    
    @Value("${vnpay.payUrl}")
    private String payUrl;
    
    @Value("${vnpay.returnUrl}")
    private String returnUrl;
    
    @Value("${vnpay.apiUrl}")
    private String apiUrl;
    
    @Value("${vnpay.frontendUrl}")
    private String frontendUrl;
    
    public static final String VERSION = "2.1.0";
    public static final String COMMAND = "pay";
    public static final String ORDER_TYPE = "other";
    public static final String CURRENCY_CODE = "VND";
    public static final String LOCALE = "vn";
}
