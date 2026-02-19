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

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;

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

    // [ADDED] Bỏ qua filter cho các endpoint public (login/refresh) và tài nguyên tĩnh
    private static final List<String> SKIP_PREFIXES = Arrays.asList(
            "/dangnhap",
            "/dangnhap/refresh",
            "/dangky",
            "/admin/dangnhap",
            "/admin/dangnhap/refresh",
            "/ai/",
            "/AnhDichVuCungCap/",
            "/static/",
            "/admin/dashboard/dichvu/anh/",
            "/admin/dashboard/dichvu/luachon/anh/",
            // Với /api prefix (khi Nginx proxy)
            "/api/dangnhap",
            "/api/dangnhap/refresh",
            "/api/dangky",
            "/api/admin/dangnhap",
            "/api/admin/dangnhap/refresh",
            "/api/admin/current-user",
            "/api/ai/",
            "/api/AnhDichVuCungCap/",
            "/api/static/"
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

                    // Lấy roles từ token để xác định user type
                    List<String> roles = jwtUtil.getRoles(token);
                    // Dùng permissions claim để xác định admin token
                    // Chỉ admin token mới có permissions claim
                    List<String> permissions = jwtUtil.getPermissions(token);
                    boolean isAdmin = !permissions.isEmpty();

                    if (isAdmin) {
                        // === ADMIN USER: Tạo AdminUserDetails từ TOKEN (không load database) ===
                        // Sử dụng permissions và roles từ token thay vì database
                        Set<String> roleSet = new HashSet<>(roles);
                        Set<String> permissionSet = new HashSet<>(permissions);

                        // Tạo AdminUserDetails từ token data
                        AdminUserDetails adminUserDetails = AdminUserDetails.fromToken(
                            username,
                            roleSet,
                            permissionSet
                        );

                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        adminUserDetails, null, adminUserDetails.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    } else {
                        // === REGULAR USER: Load từ database như trước ===
                        UserDetails userDetails = userService.loadUserByUsername(username);
                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            }

            chain.doFilter(request, response);

        } catch (ExpiredJwtException ex) {
            unauthorized(response, "Access token expired"); // 401
        } catch (JwtException ex) {
            unauthorized(response, "Invalid access token"); // 401
        }
    }

    /** Lấy token: ưu tiên Authorization header, fallback cookie */
    private String resolveToken(HttpServletRequest request) {
        // 1. Ưu tiên Authorization header (frontend gửi token chính xác theo user type)
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }
        // 2. Fallback: đọc từ cookie (admin_access_token hoặc accessToken)
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            // Kiểm tra admin cookie trước
            for (Cookie c : cookies) {
                if ("admin_access_token".equals(c.getName())) {
                    return c.getValue();
                }
            }
            // Fallback customer cookie
            for (Cookie c : cookies) {
                if ("accessToken".equals(c.getName())) {
                    return c.getValue();
                }
            }
        }
        return null;
    }

    private void unauthorized(HttpServletResponse response, String message) throws java.io.IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"message\":\"" + message + "\"}");
    }
}
