package com.example.j2ee.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RateLimitServiceTest {

    private RateLimitService service;

    @BeforeEach
    void setUp() {
        service = new RateLimitService();
    }

    @Test
    void tryAcquire_withinLimit_allows() {
        for (int i = 0; i < 5; i++) {
            assertTrue(service.tryAcquire("ip-1|/dangnhap", 5));
        }
    }

    @Test
    void tryAcquire_overLimit_denies() {
        for (int i = 0; i < 3; i++) {
            assertTrue(service.tryAcquire("ip-2|/dangnhap", 3));
        }
        assertFalse(service.tryAcquire("ip-2|/dangnhap", 3));
        assertFalse(service.tryAcquire("ip-2|/dangnhap", 3));
    }

    @Test
    void tryAcquire_differentKeys_independent() {
        for (int i = 0; i < 2; i++) {
            assertTrue(service.tryAcquire("ip-a|/dangky", 2));
        }
        assertFalse(service.tryAcquire("ip-a|/dangky", 2));
        assertTrue(service.tryAcquire("ip-b|/dangky", 2));
    }

    @Test
    void clear_resetsCounters() {
        assertTrue(service.tryAcquire("ip-c|/x", 1));
        assertFalse(service.tryAcquire("ip-c|/x", 1));
        service.clear();
        assertTrue(service.tryAcquire("ip-c|/x", 1));
    }
}
