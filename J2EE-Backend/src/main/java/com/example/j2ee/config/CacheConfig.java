package com.example.j2ee.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Cấu hình Spring Cache với Caffeine
 * TTL 5 phút cho các cache thống kê
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                "thongKeTongQuan",
                "doanhThuTheoNgay",
                "thongKeNgay");

        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES) // TTL 5 phút
                .maximumSize(100) // Max 100 entries per cache
                .recordStats()); // Enable statistics

        return cacheManager;
    }
}
