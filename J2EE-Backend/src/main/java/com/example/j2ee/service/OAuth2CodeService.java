package com.example.j2ee.service;

import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Cấp mã dùng một lần (one-time code) cho đăng nhập OAuth2.
 * Tránh đặt access/refresh token trực tiếp lên URL callback (lộ qua
 * browser history, server log, header Referer).
 * Mã chỉ sống 2 phút và bị xóa ngay sau lần đổi đầu tiên.
 */
@Service
public class OAuth2CodeService {

    private static final long CODE_TTL_MILLIS = 2 * 60 * 1000L;

    public static class CodeEntry {
        public final String accessToken;
        public final String refreshToken;
        public final String email;

        CodeEntry(String accessToken, String refreshToken, String email) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.email = email;
        }
    }

    private static class StoredCode extends CodeEntry {
        final long expiresAt;

        StoredCode(String accessToken, String refreshToken, String email, long expiresAt) {
            super(accessToken, refreshToken, email);
            this.expiresAt = expiresAt;
        }
    }

    private final ConcurrentHashMap<String, StoredCode> codes = new ConcurrentHashMap<>();

    public String create(String accessToken, String refreshToken, String email) {
        String code = UUID.randomUUID().toString().replace("-", "")
                + UUID.randomUUID().toString().replace("-", "");
        codes.put(code, new StoredCode(accessToken, refreshToken, email,
                System.currentTimeMillis() + CODE_TTL_MILLIS));
        return code;
    }

    /**
     * Đổi mã lấy token. Mã chỉ dùng được 1 lần; mã sai/hết hạn trả về null.
     */
    public synchronized CodeEntry consume(String code) {
        if (code == null || code.isEmpty()) {
            return null;
        }
        StoredCode stored = codes.remove(code);
        if (stored == null || System.currentTimeMillis() > stored.expiresAt) {
            return null;
        }
        return stored;
    }
}
