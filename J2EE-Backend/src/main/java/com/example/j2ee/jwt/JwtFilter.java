package com.example.j2ee.jwt;

import com.example.j2ee.security.AdminUserDetails;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
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

    // Skip filter cho public endpoints và static resources
    private static final List<String> SKIP_PREFIXES = List.of(
            "/dangnhap", "/dangky", "/admin/dangnhap",
            "/ai/", "/AnhDichVuCungCap/", "/static/",
            "/admin/dashboard/dichvu/anh/", "/admin/dashboard/dichvu/luachon/anh/",
            "/api/dangnhap", "/api/dangky", "/api/admin/dangnhap", "/api/admin/current-user",
            "/api/ai/", "/api/AnhDichVuCungCap/", "/api/static/"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;
        String path = request.getRequestURI();
        for (String prefix : SKIP_PREFIXES) {
            if (path.equals(prefix) || path.startsWith(prefix)) return true;
        }
        String lower = path.toLowerCase();
        return lower.endsWith(".svg") || lower.endsWith(".png") || lower.endsWith(".jpg")
                || lower.endsWith(".jpeg") || lower.endsWith(".gif");
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
            // Token hết hạn: không set authentication và tiếp tục chain.
            // - Endpoint permitAll() vẫn hoạt động bình thường cho khách vãng lai.
            // - Endpoint authenticated() sẽ bị Spring Security chặn và trả 401 qua entrypoint.
            chain.doFilter(request, response);
        } catch (JwtException ex) {
            unauthorized(response, "Invalid access token"); // 401
        }
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

    private void unauthorized(HttpServletResponse response, String message) throws java.io.IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"message\":\"" + message + "\"}");
    }
}
