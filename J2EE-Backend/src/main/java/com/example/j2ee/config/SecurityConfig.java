package com.example.j2ee.config;

import com.example.j2ee.jwt.JwtFilter;
import com.example.j2ee.security.DynamicAdminAuthorizationManager;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.core.env.Environment;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final UserDetailsService userDetailsService;
    private final UserDetailsService adminDetailsService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final OAuth2FailureHandler oAuth2FailureHandler;
    private final PasswordEncoder passwordEncoder;
    private final DynamicAdminAuthorizationManager dynamicAdminAuthManager;
    private final Environment environment;

    public SecurityConfig(
            @Lazy JwtFilter jwtFilter,
            @Lazy @Qualifier("userAccountDetailsService") UserDetailsService userDetailsService,
            @Lazy @Qualifier("adminAccountDetailsService") UserDetailsService adminDetailsService,
            OAuth2SuccessHandler oAuth2SuccessHandler,
            OAuth2FailureHandler oAuth2FailureHandler,
            PasswordEncoder passwordEncoder,
            DynamicAdminAuthorizationManager dynamicAdminAuthManager,
            Environment environment
    ) {
        this.jwtFilter = jwtFilter;
        this.userDetailsService = userDetailsService;
        this.adminDetailsService = adminDetailsService;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
        this.oAuth2FailureHandler = oAuth2FailureHandler;
        this.passwordEncoder = passwordEncoder;
        this.dynamicAdminAuthManager = dynamicAdminAuthManager;
        this.environment = environment;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Đọc danh sách allowed origins từ biến môi trường
        // Mặc định: localhost + production domains
        String corsOrigins = environment.getProperty("CORS_ALLOWED_ORIGINS",
                "http://localhost:3000,http://localhost:5173,https://jadt-airline.io.vn,https://www.jadt-airline.io.vn");

        List<String> allowedOrigins = Arrays.asList(corsOrigins.split(","));
        configuration.setAllowedOriginPatterns(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // CORS preflight OPTIONS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Public endpoints
                        .requestMatchers("/api/dangky", "/api/dangnhap/**", "/api/admin/dangnhap/**", "/api/admin/current-user").permitAll()
                        .requestMatchers("/api/forgot-password/**", "/api/auth/**").permitAll()
                        .requestMatchers("/api/oauth2/**", "/api/login/oauth2/**").permitAll()
                        .requestMatchers("/api/error").permitAll()
                        // OAuth2 callbacks (không có /api prefix - được gọi trực tiếp từ OAuth provider)
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        // VNPay, Check-in, Booking endpoints
                        .requestMatchers("/api/vnpay/payment-callback", "/api/checkin/**", "/api/client/datcho/**").permitAll()
                        // Static resources
                        .requestMatchers("/api/ai/**", "/static/**").permitAll()
                        .requestMatchers("/api/admin/dashboard/dichvu/anh/**", "/api/admin/dashboard/dichvu/luachon/anh/**").permitAll()
                        .requestMatchers("/api/admin/dashboard/chuyenbay/**").permitAll()
                        .requestMatchers("/api/ws/**", "/api/countries").permitAll()
                        // Direct static resources (không có /api - được gọi trực tiếp từ browser/img tags)
                        .requestMatchers("/ai/**", "/AnhDichVuCungCap/**", "/admin/dashboard/dichvu/anh/**").permitAll()
                        .requestMatchers("/admin/dashboard/dichvu/luachon/anh/**", "/admin/dashboard/chuyenbay/**").permitAll()
                        .requestMatchers("/ws/**", "/countries").permitAll()
                        // Admin endpoints (dynamic authorization based on roles in JWT)
                        .requestMatchers("/api/admin/dashboard/**", "/api/admin/datcho/**").access(dynamicAdminAuthManager)
                        .requestMatchers("/api/admin/audit-logs/**", "/api/admin/dangxuat/all").access(dynamicAdminAuthManager)
                        .requestMatchers("/api/sanbay/**").permitAll()
                        .anyRequest().authenticated()
                )

                .exceptionHandling(e -> e
                        .authenticationEntryPoint(restAuthEntryPoint())
                        .accessDeniedHandler(restAccessDeniedHandler())
                )

                .httpBasic(h -> h.disable())
                .formLogin(f -> f.disable())
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
