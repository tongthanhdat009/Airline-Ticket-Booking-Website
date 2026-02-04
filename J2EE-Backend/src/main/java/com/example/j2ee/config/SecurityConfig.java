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
                        // ================== PUBLIC API ENDPOINTS (v1) ==================
                        // Không yêu cầu authentication - dành cho customer frontend
                        .requestMatchers("/api/v1/**").permitAll()
                        
                        // ================== INTERNAL API ENDPOINTS ==================
                        // Yêu cầu authentication + dynamic admin authorization
                        // Permissions được kiểm tra tại controller level với @RequirePermission
                        .requestMatchers("/internal/**").access(dynamicAdminAuthManager)
                        
                        // ================== AUTH ENDPOINTS ==================
                        .requestMatchers("/dangky", "/dangnhap", "/dangnhap/**").permitAll()
                        .requestMatchers("/admin/dangnhap", "/admin/dangnhap/**").permitAll()
                        .requestMatchers("/api/forgot-password/**").permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        
                        // ================== PAYMENT & EXTERNAL ==================
                        .requestMatchers("/api/vnpay/payment-callback").permitAll()
                        .requestMatchers("/api/checkin/**").permitAll()
                        .requestMatchers("/api/ai/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/countries").permitAll()
                        
                        // ================== STATIC RESOURCES ==================
                        .requestMatchers("/static/**", "/AnhDichVuCungCap/**").permitAll()
                        .requestMatchers("/AnhLuaChonDichVu/**").permitAll()
                        
                        // Rest requires authentication
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
