package com.example.j2ee.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class OAuth2CodeServiceTest {

    private OAuth2CodeService service;

    @BeforeEach
    void setUp() {
        service = new OAuth2CodeService();
    }

    @Test
    void create_returnsNonNullCode() {
        String code = service.create("at", "rt", "a@b.c");
        assertNotNull(code);
        assertFalse(code.isBlank());
    }

    @Test
    void consume_validCode_returnsEntryOnce() {
        String code = service.create("at-1", "rt-1", "a@b.c");
        OAuth2CodeService.CodeEntry first = service.consume(code);
        assertNotNull(first);
        assertEquals("at-1", first.accessToken);
        assertEquals("rt-1", first.refreshToken);
        assertEquals("a@b.c", first.email);

        // Dùng 1 lần: lần 2 phải null
        assertNull(service.consume(code));
    }

    @Test
    void consume_unknownCode_returnsNull() {
        assertNull(service.consume("nope"));
        assertNull(service.consume(null));
        assertNull(service.consume(""));
    }
}
