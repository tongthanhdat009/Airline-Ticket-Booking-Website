package com.example.j2ee.config;

import com.example.j2ee.service.RateLimitService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Chặn brute-force / spam vào các endpoint auth nhạy cảm.
 * Trả 429 (không tiết lộ gì thêm) khi vượt quota 60 giây / IP / endpoint.
 */
@Component
@RequiredArgsConstructor
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;

    private static final List<Map.Entry<String, Integer>> RULES = List.of(
            Map.entry("/dangnhap", 10),
            Map.entry("/admin/dangnhap", 10),
            Map.entry("/dangky", 10),
            Map.entry("/check-email", 30),
            Map.entry("/check-phone", 30),
            Map.entry("/auth/forgot-password", 5),
            Map.entry("/auth/verify-otp", 10),
            Map.entry("/auth/reset-password", 10),
            Map.entry("/auth/send-verification", 5),
            Map.entry("/auth/resend-verification", 5)
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        if (HttpMethod.POST.matches(request.getMethod())) {
            String contextPath = request.getContextPath() == null ? "" : request.getContextPath();
            String path = request.getRequestURI();
            if (path.startsWith(contextPath)) {
                path = path.substring(contextPath.length());
            }
            for (Map.Entry<String, Integer> rule : RULES) {
                if (path.equals(rule.getKey()) || path.startsWith(rule.getKey() + "/")) {
                    String key = clientIp(request) + "|" + rule.getKey();
                    if (!rateLimitService.tryAcquire(key, rule.getValue())) {
                        response.setStatus(429);
                        response.setContentType("application/json;charset=UTF-8");
                        response.getWriter().write(
                                "{\"success\":false,\"message\":\"Quá nhiều yêu cầu, vui lòng thử lại sau\",\"data\":null}");
                        return;
                    }
                    break;
                }
            }
        }
        chain.doFilter(request, response);
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
