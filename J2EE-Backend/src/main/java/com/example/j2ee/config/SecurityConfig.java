package com.example.j2ee.config;

import com.example.j2ee.jwt.JwtFilter;
import com.example.j2ee.security.DynamicAdminAuthorizationManager;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final UserDetailsService userDetailsService;
    private final UserDetailsService adminDetailsService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final OAuth2FailureHandler oAuth2FailureHandler;
    private final PasswordEncoder passwordEncoder;
    private final DynamicAdminAuthorizationManager dynamicAdminAuthManager;

    public SecurityConfig(
            @Lazy JwtFilter jwtFilter,
            @Lazy @Qualifier("userAccountDetailsService") UserDetailsService userDetailsService,
            @Lazy @Qualifier("adminAccountDetailsService") UserDetailsService adminDetailsService,
            OAuth2SuccessHandler oAuth2SuccessHandler,
            OAuth2FailureHandler oAuth2FailureHandler,
            PasswordEncoder passwordEncoder,
            DynamicAdminAuthorizationManager dynamicAdminAuthManager
    ) {
        this.jwtFilter = jwtFilter;
        this.userDetailsService = userDetailsService;
        this.adminDetailsService = adminDetailsService;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
        this.oAuth2FailureHandler = oAuth2FailureHandler;
        this.passwordEncoder = passwordEncoder;
        this.dynamicAdminAuthManager = dynamicAdminAuthManager;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // public endpoints - đặt trước tất cả
                        .requestMatchers("/dangky", "/dangnhap", "/dangnhap/**").permitAll()
                        .requestMatchers("/admin/dangnhap", "/admin/dangnhap/**").permitAll()
                        .requestMatchers("/forgot-password/**").permitAll()
                        .requestMatchers("/auth/**").permitAll() // Allow all auth endpoints including verify-email
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        // VNPay callback endpoint - không yêu cầu authentication
                        .requestMatchers("/vnpay/payment-callback").permitAll()
                        // Online Check-in API - không yêu cầu authentication
                        .requestMatchers("/checkin/**").permitAll()
                        // Booking API - cho phép khách vãng lai đặt vé
                        .requestMatchers("/client/datcho/**").permitAll()
                        // static resources
                        .requestMatchers("/ai/**").permitAll()
                        .requestMatchers("/static/**", "/AnhDichVuCungCap/**").permitAll()
                        .requestMatchers("/admin/dashboard/dichvu/anh/**").permitAll()
                        .requestMatchers("/admin/dashboard/dichvu/luachon/anh/**").permitAll()
                        // Allow fetching flight services images and service list for public client
                        .requestMatchers("/admin/dashboard/chuyenbay/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/countries").permitAll()
                        // ================== ADMIN DASHBOARD ENDPOINTS ==================
                        // Sử dụng Dynamic Admin Authorization Manager
                        // Kiểm tra user có vai trò admin hợp lệ từ database không
                        // Các vai trò được định nghĩa trong database: SUPER_ADMIN, QUAN_LY, NHAN_VIEN_VE, KE_TOAN, VAN_HANH
                        //
                        // Backend chỉ kiểm tra role级别的访问权限
                        // Chi tiết permissions (VIEW, CREATE, UPDATE, DELETE) được xử lý bởi frontend
                        //
                        // Lợi ích:
                        // 1. Giảm độ trễ - không cần query database mỗi request
                        // 2. Đơn giản - chỉ check role, không check từng endpoint
                        // 3. Hiệu suất - roles được cache trong JWT token
                        // 4. Flexible - frontend ẩn/hiện UI dựa trên permissions
                        .requestMatchers("/admin/dashboard/**").access(dynamicAdminAuthManager)
                        .requestMatchers("/admin/**").access(dynamicAdminAuthManager)
                        // rest yêu cầu authentication
                        .requestMatchers("/sanbay/**").permitAll()
                        .requestMatchers("/AnhDichVuCungCap/**").permitAll()
                        .anyRequest().authenticated()
                )

                // Phân biệt 401 (chưa xác thực/hết hạn) và 403 (thiếu quyền)
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(restAuthEntryPoint())
                        .accessDeniedHandler(restAccessDeniedHandler())
                )

                .httpBasic(h -> h.disable())
                .formLogin(f -> f.disable())
                
                // OAuth2 Login Configuration
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2SuccessHandler)
                        .failureHandler(oAuth2FailureHandler)
                )

                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    AuthenticationEntryPoint restAuthEntryPoint() {
        return (request, response, ex) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"message\":\"Unauthorized\"}");
        };
    }

    @Bean
    AccessDeniedHandler restAccessDeniedHandler() {
        return (request, response, ex) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"message\":\"Forbidden\"}");
        };
    }

    @Bean
    public DaoAuthenticationProvider adminAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(adminDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public DaoAuthenticationProvider userAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        return new ProviderManager(
                adminAuthenticationProvider(),
                userAuthenticationProvider()
        );
    }
}
