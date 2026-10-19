package com.example.j2ee.service;

import org.springframework.stereotype.Service;

import java.util.ArrayDeque;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Giới hạn tần suất gọi API theo sliding window 60 giây (in-memory).
 * Dùng cho các endpoint auth nhạy cảm (đăng nhập, OTP, đăng ký) để chống
 * brute-force, credential stuffing và spam mail.
 *
 * LƯU Ý: lưu in-memory nên mỗi instance đếm riêng; khi chạy nhiều instance
 * hoặc cần chính xác tuyệt đối hãy chuyển sang Redis.
 */
@Service
public class RateLimitService {

    private static final long WINDOW_MILLIS = 60_000L;

    private final ConcurrentHashMap<String, ArrayDeque<Long>> buckets = new ConcurrentHashMap<>();

    /**
     * Thử lấy 1 lượt quota cho key trong 60 giây gần nhất.
     *
     * @param key        định danh (VD: IP + endpoint)
     * @param maxPerMinute số request tối đa trong 60 giây
     * @return true nếu được phép, false nếu đã vượt giới hạn
     */
    public boolean tryAcquire(String key, int maxPerMinute) {
        long now = System.currentTimeMillis();
        long windowStart = now - WINDOW_MILLIS;
        ArrayDeque<Long> queue = buckets.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (queue) {
            while (!queue.isEmpty() && queue.peekFirst() < windowStart) {
                queue.pollFirst();
            }
            if (queue.size() >= maxPerMinute) {
                return false;
            }
            queue.addLast(now);
            return true;
        }
    }

    /** Xóa toàn bộ bộ đếm (phục vụ test). */
    void clear() {
        buckets.clear();
    }
}
