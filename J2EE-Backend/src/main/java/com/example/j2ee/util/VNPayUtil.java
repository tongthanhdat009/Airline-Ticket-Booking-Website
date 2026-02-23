package com.example.j2ee.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class VNPayUtil {

    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }

    /**
     * Tính hash cho tất cả các fields - theo ĐÚNG VNPay Java SDK v2.1.0.
     * 
     * VNPay SDK verification flow:
     * 1. Lấy decoded param values từ request.getParameter()
     * 2. URL-encode values với US-ASCII
     * 3. Build hashData: fieldName=URLEncode(fieldValue)&...
     *    (field name KHÔNG encode vì vnp_* chỉ có ASCII chars)
     * 4. HMAC-SHA512(secretKey, hashData)
     */
    public static String hashAllFields(Map<String, String> fields, String secretKey) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                // Field name KHÔNG encode (matching VNPay SDK)
                sb.append(fieldName);
                sb.append('=');
                // Field value URL-encode US-ASCII (matching VNPay SDK)
                sb.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
            }
            // Append '&' nếu còn field tiếp theo - matching VNPay SDK behavior
            if (itr.hasNext()) {
                sb.append('&');
            }
        }
        return hmacSHA512(secretKey.trim(), sb.toString());
    }

    /**
     * Verify chữ ký VNPay từ callback/IPN bằng RAW query string.
     * Cách tiếp cận bulletproof: dùng trực tiếp giá trị URL-encoded từ query string
     * thay vì re-encode giá trị đã decoded, tránh mọi sai lệch encoding.
     *
     * @param request HttpServletRequest chứa raw query string
     * @param secretKey VNPay secret key
     * @return Map với "isValid" (boolean), "receivedHash" (String), "calculatedHash" (String), "hashData" (String)
     */
    public static Map<String, Object> verifySecureHash(jakarta.servlet.http.HttpServletRequest request, String secretKey) {
        Map<String, Object> result = new HashMap<>();
        String queryString = request.getQueryString();

        if (queryString == null || queryString.isEmpty()) {
            result.put("isValid", false);
            result.put("error", "Empty query string");
            return result;
        }

        // Parse raw query string giữ nguyên URL-encoded values
        TreeMap<String, String> sortedParams = new TreeMap<>();
        String receivedHash = null;

        for (String param : queryString.split("&")) {
            int idx = param.indexOf('=');
            if (idx > 0) {
                String key = param.substring(0, idx);
                String value = idx < param.length() - 1 ? param.substring(idx + 1) : "";
                if ("vnp_SecureHash".equals(key)) {
                    receivedHash = value;
                } else if (!"vnp_SecureHashType".equals(key)) {
                    sortedParams.put(key, value);
                }
            }
        }

        // Build hashData từ sorted URL-encoded params (ĐÚNG NGUYÊN GỐC từ VNPay)
        StringBuilder hashData = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            if (!first) {
                hashData.append('&');
            }
            hashData.append(entry.getKey());
            hashData.append('=');
            hashData.append(entry.getValue());
            first = false;
        }

        String calculatedHash = hmacSHA512(secretKey.trim(), hashData.toString());
        boolean isValid = calculatedHash.equalsIgnoreCase(receivedHash);

        result.put("isValid", isValid);
        result.put("receivedHash", receivedHash);
        result.put("calculatedHash", calculatedHash);
        result.put("hashData", hashData.toString());

        return result;
    }

    public static String getIpAddress(jakarta.servlet.http.HttpServletRequest request) {
        String ipAddress;
        try {
            ipAddress = request.getHeader("X-FORWARDED-FOR");
            if (ipAddress == null) {
                ipAddress = request.getRemoteAddr();
            }
        } catch (Exception e) {
            ipAddress = "Invalid IP:" + e.getMessage();
        }
        return ipAddress;
    }

    public static String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
