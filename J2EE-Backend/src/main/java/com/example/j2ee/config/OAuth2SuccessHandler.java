package com.example.j2ee.config;

import com.example.j2ee.jwt.JwtUtil;
import com.example.j2ee.model.HanhKhach;
import com.example.j2ee.model.RefreshToken;
import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.repository.HanhKhachRepository;
import com.example.j2ee.repository.TaiKhoanRepository;
import com.example.j2ee.service.RefreshTokenService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Date;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final TaiKhoanRepository taiKhoanRepository;
    private final HanhKhachRepository hanhKhachRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    public OAuth2SuccessHandler(JwtUtil jwtUtil,
                                TaiKhoanRepository taiKhoanRepository,
                                HanhKhachRepository hanhKhachRepository,
                                PasswordEncoder passwordEncoder,
                                RefreshTokenService refreshTokenService) {
        this.jwtUtil = jwtUtil;
        this.taiKhoanRepository = taiKhoanRepository;
        this.hanhKhachRepository = hanhKhachRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        // Lấy thông tin từ Google
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");
        
        // Tìm hoặc tạo tài khoản
        Optional<TaiKhoan> existingAccount = taiKhoanRepository.findByEmail(email);
        TaiKhoan taiKhoan;
        
        if (existingAccount.isEmpty()) {
            // Tạo HanhKhach mới
            HanhKhach hanhKhach = new HanhKhach();
            hanhKhach.setHoVaTen(name);
            hanhKhach = hanhKhachRepository.save(hanhKhach);
            
            // Tạo tài khoản mới từ Google
            taiKhoan = new TaiKhoan();
            taiKhoan.setEmail(email);
            taiKhoan.setMatKhauBam(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password
            taiKhoan.setNgayTao(new Date());
            taiKhoan.setTrangThai("ACTIVE");
            taiKhoan.setOauth2Provider("GOOGLE");
            taiKhoan.setEmailVerified(true); // Google đã verify email rồi
            taiKhoan.setHanhKhach(hanhKhach);
            taiKhoanRepository.save(taiKhoan);
        } else {
            taiKhoan = existingAccount.get();
            // Cập nhật oauth2Provider nếu chưa có
            if (taiKhoan.getOauth2Provider() == null) {
                taiKhoan.setOauth2Provider("GOOGLE");
                taiKhoan.setEmailVerified(true);
                taiKhoanRepository.save(taiKhoan);
            }
        }

        // Tạo JWT tokens - Access token với role CUSTOMER cho OAuth2 users
        String accessToken = jwtUtil.generateAccessToken(email, "CUSTOMER");

        // Tạo và lưu refresh token vào database
        RefreshToken refreshTokenEntity = refreshTokenService.createRefreshTokenForCustomer(email);
        String refreshToken = refreshTokenEntity.getToken();
        
        // Redirect về frontend với tokens
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/oauth2/callback")
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .queryParam("email", email)
                .build().toUriString();
        
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
