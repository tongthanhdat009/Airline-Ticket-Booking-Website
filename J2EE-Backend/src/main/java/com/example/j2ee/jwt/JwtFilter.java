package com.example.j2ee.jwt;

import com.example.j2ee.security.AdminUserDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * JWT Authentication Filter.
 *
 * <p>Nguyên tắc thiết kế:</p>
 * <ul>
 *   <li>Filter này CHỈ có nhiệm vụ set Authentication vào SecurityContext nếu có token hợp lệ.</li>
 *   <li>KHÔNG BAO GIỜ block request hoặc trả lỗi 401 trực tiếp — việc đó do Spring Security xử lý.</li>
 *   <li>Mọi exception đều được catch → request tiếp tục như anonymous user.</li>
 *   <li>KHÔNG cần danh sách SKIP_PREFIXES riêng — SecurityConfig.permitAll() đã xử lý authorization.</li>
 * </ul>
 */
@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userService;
    private final UserDetailsService adminService;

    public JwtFilter(
            JwtUtil jwtUtil,
            @Lazy @Qualifier("userAccountDetailsService") UserDetailsService userService,
            @Lazy @Qualifier("adminAccountDetailsService") UserDetailsService adminService
    ) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.adminService = adminService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Chỉ skip filter cho những request chắc chắn không cần JWT
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;

        String path = request.getRequestURI();
        // WebSocket không dùng JWT filter (dùng handshake riêng)
        if (path.startsWith("/ws/")) return true;

        // Static resources
        String lower = path.toLowerCase();
        return lower.endsWith(".svg") || lower.endsWith(".png") || lower.endsWith(".jpg")
                || lower.endsWith(".jpeg") || lower.endsWith(".gif") || lower.endsWith(".webp");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws java.io.IOException, jakarta.servlet.ServletException {

        // Bước 1: Thử set authentication từ token (nếu có)
        // Mọi lỗi đều được catch — request luôn tiếp tục như anonymous nếu token không hợp lệ.
        try {
            String token = resolveToken(request);

            if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Bỏ qua refresh token
                Object typObj = jwtUtil.getClaim(token, "typ");
                if (!"refresh".equals(typObj) && jwtUtil.validate(token)) {
                    String username = jwtUtil.getSubject(token);
                    if (username != null) {
                        setAuthentication(token, username);
                        logger.debug("Authenticated user: " + username + " for " + request.getRequestURI());
                    }
                }
            }
        } catch (Exception ex) {
            // Token hết hạn, sai chữ ký, user không tồn tại, v.v.
            // → Xóa SecurityContext và tiếp tục như anonymous user.
            // → Endpoint permitAll() vẫn hoạt động bình thường.
            // → Endpoint cần auth sẽ bị Spring Security chặn → 401 qua AuthenticationEntryPoint.
            SecurityContextHolder.clearContext();
            logger.warn("JWT auth failed for " + request.getRequestURI()
                    + " (" + ex.getClass().getSimpleName() + ": " + ex.getMessage()
                    + "). Continuing as anonymous.");
        }

        // Bước 2: LUÔN tiếp tục filter chain — không bao giờ block tại đây
        chain.doFilter(request, response);
    }

    /**
     * Set authentication vào SecurityContext dựa trên token claims.
     * Admin token có permissions claim, regular user thì load từ database.
     */
    private void setAuthentication(String token, String username) {
        List<String> roles = jwtUtil.getRoles(token);
        List<String> permissions = jwtUtil.getPermissions(token);
        boolean isAdmin = !permissions.isEmpty();

        UserDetails userDetails;
        if (isAdmin) {
            // ADMIN: Tạo từ token data (không query database)
            Set<String> roleSet = new HashSet<>(roles);
            Set<String> permissionSet = new HashSet<>(permissions);
            userDetails = AdminUserDetails.fromToken(username, roleSet, permissionSet);
        } else {
            // REGULAR USER: Load từ database
            userDetails = userService.loadUserByUsername(username);
        }

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    /** Lấy token: ưu tiên Authorization header, fallback cookie */
    private String resolveToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                String name = c.getName();
                if ("admin_access_token".equals(name) || "accessToken".equals(name)) {
                    return c.getValue();
                }
            }
        }
        return null;
    }
}
