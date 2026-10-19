package com.example.j2ee.controller;

import com.example.j2ee.service.OAuth2CodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Đổi one-time code (từ OAuth2 callback) lấy token.
 * Token không bao giờ xuất hiện trên URL.
 */
@RestController
@RequestMapping("/oauth2")
@RequiredArgsConstructor
public class OAuth2Controller {

    private final OAuth2CodeService oAuth2CodeService;

    @PostMapping("/exchange")
    public ResponseEntity<?> exchange(@RequestBody Map<String, String> body) {
        OAuth2CodeService.CodeEntry entry = oAuth2CodeService.consume(
                body == null ? null : body.get("code"));
        if (entry == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Mã xác thực không hợp lệ hoặc đã hết hạn");
            return ResponseEntity.badRequest().body(error);
        }
        Map<String, String> response = new HashMap<>();
        response.put("accessToken", entry.accessToken);
        response.put("refreshToken", entry.refreshToken);
        response.put("email", entry.email);
        return ResponseEntity.ok(response);
    }
}
