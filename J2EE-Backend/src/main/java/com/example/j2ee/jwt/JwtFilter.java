package com.example.j2ee.jwt;

import com.example.j2ee.service.AdminRoleService;
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

import java.util.Arrays;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;

import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userService;
    private final UserDetailsService adminService;
    private final AdminRoleService adminRoleService;

    public JwtFilter(
            JwtUtil jwtUtil,
            @Lazy @Qualifier("userAccountDetailsService") UserDetailsService userService,
            @Lazy @Qualifier("adminAccountDetailsService") UserDetailsService adminService,
            @Lazy AdminRoleService adminRoleService
    ) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.adminService = adminService;
        this.adminRoleService = adminRoleService;
    }

    // [ADDED] Bỏ qua filter cho các endpoint public (login/refresh) và tài nguyên tĩnh
    private static final List<String> SKIP_PREFIXES = Arrays.asList(
            "/dangnhap",
            "/dangnhap/refresh",
            "/dangky",
            "/admin/dangnhap",
            "/admin/dangnhap/refresh",
            "/ai/",
            "/AnhDichVuCungCap/",
            "/AnhLuaChonDichVu/",
            "/static/"
    );
    // // Bỏ qua filter cho login/refresh và preflight
    // private static final List<String> SKIP_PATHS = List.of("/dangnhap", "/dangnhap/refresh", "/dangky",
    //         "/admin/dangnhap", "/admin/dangnhap/refresh");

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true; // preflight CORS
        String path = request.getRequestURI();
        // skip by prefix
        for (String p : SKIP_PREFIXES) {
            if (path.equals(p) || path.startsWith(p)) return true;
        }
        // skip common static extensions
        String lower = path.toLowerCase();
        if (lower.endsWith(".svg") || lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".gif")) {
            return true;
        }
        // OPTIONS preflight
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws java.io.IOException, jakarta.servlet.ServletException {

        String token = resolveToken(request); // đọc từ cookie accessToken hoặc header

        try {
            // Không có token -> cho qua; endpoint yêu cầu auth sẽ bị EntryPoint trả 401
            if (token != null) {
                Object typObj = jwtUtil.getClaim(token, "typ");
                if ("refresh".equals(typObj)) {
                    // Cố dùng refresh token gọi API -> trả 401
                    unauthorized(response, "Refresh token is not allowed for this endpoint");
                    return;
                }

                String username = jwtUtil.getSubject(token);
                if (username != null
                        && SecurityContextHolder.getContext().getAuthentication() == null
                        && jwtUtil.validate(token)) {

                    // Xác định xem user là admin hay user thường bằng cách kiểm tra roles
                    UserDetailsService uds = hasAdminRole(token) ? adminService : userService;

                    UserDetails userDetails = uds.loadUserByUsername(username);
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }

            chain.doFilter(request, response);

        } catch (ExpiredJwtException ex) {
            unauthorized(response, "Access token expired"); // 401
        } catch (JwtException ex) {
            unauthorized(response, "Invalid access token"); // 401
        }
    }

    /** Lấy token: ưu tiên cookie accessToken, fallback Authorization header */
    private String resolveToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if ("accessToken".equals(c.getName())) {
                    return c.getValue();
                }
            }
        }
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }
        return null;
    }

    private boolean isAdminRole(String role) {
        if (role == null) return false;
        String r = role.trim().toUpperCase();
        return "ADMIN".equals(r) || "ROLE_ADMIN".equals(r);
    }

    /**
     * Kiểm tra xem người dùng có phải là admin dựa trên roles trong token
     * Sử dụng AdminRoleService để load roles động từ database
     * Hỗ trợ multiple roles
     */
    private boolean hasAdminRole(String token) {
        try {
            List<String> roles = jwtUtil.getRoles(token);
            // Lấy tất cả admin roles từ database (có cache)
            var adminRoles = adminRoleService.getAllActiveRoleNames();

            return roles.stream().anyMatch(role -> {
                String r = role.trim().toUpperCase();
                // Check cả dạng có ROLE_ prefix và không có prefix
                return adminRoles.contains(r) || adminRoles.contains("ROLE_" + r);
            });
        } catch (Exception e) {
            return false;
        }
    }

    private void unauthorized(HttpServletResponse response, String message) throws java.io.IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"message\":\"" + message + "\"}");
    }
}
