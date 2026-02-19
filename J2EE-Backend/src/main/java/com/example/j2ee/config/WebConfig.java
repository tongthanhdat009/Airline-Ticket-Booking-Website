package com.example.j2ee.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class WebConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    // CORS được cấu hình tập trung trong SecurityConfig.corsConfigurationSource()
    // KHÔNG cấu hình CORS ở đây để tránh xung đột giữa Spring Security và Spring MVC
}