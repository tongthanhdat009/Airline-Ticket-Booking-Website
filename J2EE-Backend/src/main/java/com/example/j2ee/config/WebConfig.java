package com.example.j2ee.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * Cấu hình để tránh nhầm lẫn giữa static resources và API endpoints
     * Đảm bảo các request có đuôi .xxx vẫn được xử lý bởi Controller nếu có mapping phù hợp
     */
    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer.setUseTrailingSlashMatch(true);
    }

    // CORS được cấu hình tập trung trong SecurityConfig.corsConfigurationSource()
    // KHÔNG cấu hình CORS ở đây để tránh xung đột giữa Spring Security và Spring MVC
}