package com.example.j2ee.service;

import com.example.j2ee.jwt.JwtUtil;
import com.example.j2ee.model.RefreshToken;
import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.model.TaiKhoanAdmin;
import com.example.j2ee.repository.RefreshTokenRepository;
import com.example.j2ee.repository.TaiKhoanAdminRepository;
import com.example.j2ee.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final TaiKhoanAdminRepository taiKhoanAdminRepository;
    private final JwtUtil jwtUtil;

    /**
     * Tạo refresh token mới cho customer và lưu vào database
     */
    @Transactional
    public RefreshToken createRefreshTokenForCustomer(String email) {
        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản với email: " + email));

        // Tạo refresh token string
        String tokenString = jwtUtil.generateRefreshToken(email);

        // Tính thời gian hết hạn (30 ngày từ hiện tại)
        LocalDateTime expiryDate = LocalDateTime.now().plusDays(30);

        // Tạo entity RefreshToken
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(tokenString);
        refreshToken.setTaiKhoan(taiKhoan);
        refreshToken.setNgayTao(LocalDateTime.now());
        refreshToken.setNgayHetHan(expiryDate);
        refreshToken.setDaXoa(false);

        // Lưu vào database
        RefreshToken saved = refreshTokenRepository.save(refreshToken);
        log.info("Đã tạo refresh token mới cho customer: {}", email);
        return saved;
    }

    /**
     * Tạo refresh token mới cho admin và lưu vào database
     */
    @Transactional
    public RefreshToken createRefreshTokenForAdmin(String username) {
        TaiKhoanAdmin taiKhoanAdmin = taiKhoanAdminRepository.findByTenDangNhap(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản admin với username: " + username));

        // Tạo refresh token string
        String tokenString = jwtUtil.generateRefreshToken(username);

        // Tính expiration time (30 ngày từ hiện tại)
        LocalDateTime expiryDate = LocalDateTime.now().plusDays(30);

        // Tạo entity RefreshToken
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(tokenString);
        refreshToken.setTaiKhoanAdmin(taiKhoanAdmin);
        refreshToken.setNgayTao(LocalDateTime.now());
        refreshToken.setNgayHetHan(expiryDate);
        refreshToken.setDaXoa(false);

        // Lưu vào database
        RefreshToken saved = refreshTokenRepository.save(refreshToken);
        log.info("Đã tạo refresh token mới cho admin: {}", username);
        return saved;
    }

    /**
     * Kiểm tra refresh token có hợp lệ không
     * Hợp lệ khi: tồn tại trong DB, chưa bị xóa, chưa hết hạn
     */
    @Transactional(readOnly = true)
    public boolean validateRefreshToken(String token) {
        // Validate JWT signature và expiration
        if (!jwtUtil.isRefreshToken(token)) {
            log.warn("Refresh token không hợp lệ (không phải refresh token hoặc JWT invalid)");
            return false;
        }

        // Kiểm tra trong database
        Optional<RefreshToken> refreshTokenOpt = refreshTokenRepository.findByTokenAndDaXoa(token, false);

        if (refreshTokenOpt.isEmpty()) {
            log.warn("Refresh token không tồn tại hoặc đã bị xóa");
            return false;
        }

        RefreshToken refreshToken = refreshTokenOpt.get();

        // Kiểm tra hết hạn
        if (refreshToken.getNgayHetHan().isBefore(LocalDateTime.now())) {
            log.warn("Refresh token đã hết hạn");
            return false;
        }

        log.info("Refresh token hợp lệ");
        return true;
    }

    /**
     * Thu hồi (revoke) một refresh token cụ thể
     */
    @Transactional
    public void revokeRefreshToken(String token) {
        Optional<RefreshToken> refreshTokenOpt = refreshTokenRepository.findByTokenAndDaXoa(token, false);

        if (refreshTokenOpt.isPresent()) {
            RefreshToken refreshToken = refreshTokenOpt.get();
            refreshToken.setDaXoa(true);
            refreshTokenRepository.save(refreshToken);
            log.info("Đã thu hồi refresh token: {}", token.substring(0, 10) + "...");
        } else {
            log.warn("Không tìm thấy refresh token để thu hồi: {}", token.substring(0, 10) + "...");
        }
    }

    /**
     * Thu hồi tất cả refresh tokens của một customer
     */
    @Transactional
    public void revokeAllRefreshTokensForCustomer(String email) {
        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản với email: " + email));

        refreshTokenRepository.revokeAllByTaiKhoan(taiKhoan);
        log.info("Đã thu hồi tất cả refresh tokens của customer: {}", email);
    }

    /**
     * Thu hồi tất cả refresh tokens của một admin
     */
    @Transactional
    public void revokeAllRefreshTokensForAdmin(String username) {
        TaiKhoanAdmin taiKhoanAdmin = taiKhoanAdminRepository.findByTenDangNhap(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản admin với username: " + username));

        refreshTokenRepository.revokeAllByTaiKhoanAdmin(taiKhoanAdmin);
        log.info("Đã thu hồi tất cả refresh tokens của admin: {}", username);
    }

    /**
     * Thu hồi token cũ và tạo refresh token mới (rotation)
     */
    @Transactional
    public RefreshToken rotateRefreshToken(String oldToken, String username, boolean isAdmin) {
        // Thu hồi token cũ
        revokeRefreshToken(oldToken);

        // Tạo token mới
        if (isAdmin) {
            return createRefreshTokenForAdmin(username);
        } else {
            return createRefreshTokenForCustomer(username);
        }
    }

    /**
     * Lấy refresh token entity từ token string
     */
    @Transactional(readOnly = true)
    public Optional<RefreshToken> getRefreshToken(String token) {
        return refreshTokenRepository.findByTokenAndDaXoa(token, false);
    }

    /**
     * Xóa các refresh token đã hết hạn và đã bị thu hồi
     * Chạy tự động vào lúc 2:00 AM mỗi ngày
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        List<RefreshToken> expiredTokens = refreshTokenRepository.findExpiredTokens(now);

        if (!expiredTokens.isEmpty()) {
            // Soft delete expired tokens
            expiredTokens.forEach(token -> token.setDaXoa(true));
            refreshTokenRepository.saveAll(expiredTokens);

            // Hard delete revoked and expired tokens older than 7 days
            LocalDateTime cutoffDate = now.minusDays(7);
            refreshTokenRepository.deleteExpiredRevokedTokens(cutoffDate);

            log.info("Đã dọn dẹp {} refresh token đã hết hạn", expiredTokens.size());
        } else {
            log.info("Không có refresh token nào cần dọn dẹp");
        }
    }

    /**
     * Đếm số refresh tokens còn hoạt động của một customer
     */
    @Transactional(readOnly = true)
    public long countActiveTokensForCustomer(String email) {
        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản với email: " + email));

        List<RefreshToken> tokens = refreshTokenRepository.findByTaiKhoanAndDaXoa(taiKhoan, false);
        // Lọc ra các token chưa hết hạn
        return tokens.stream()
                .filter(token -> token.getNgayHetHan().isAfter(LocalDateTime.now()))
                .count();
    }

    /**
     * Đếm số refresh tokens còn hoạt động của một admin
     */
    @Transactional(readOnly = true)
    public long countActiveTokensForAdmin(String username) {
        TaiKhoanAdmin taiKhoanAdmin = taiKhoanAdminRepository.findByTenDangNhap(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản admin với username: " + username));

        List<RefreshToken> tokens = refreshTokenRepository.findByTaiKhoanAdminAndDaXoa(taiKhoanAdmin, false);
        // Lọc ra các token chưa hết hạn
        return tokens.stream()
                .filter(token -> token.getNgayHetHan().isAfter(LocalDateTime.now()))
                .count();
    }
}
