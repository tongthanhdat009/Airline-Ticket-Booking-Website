package com.example.j2ee.controller;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

import static org.junit.jupiter.api.Assertions.*;

class DuplicateMessageTest {

    @Test
    void resolveDuplicateMessage_cccdConstraint() {
        Exception e = new DataIntegrityViolationException(
                "could not execute statement; SQL [n/a]; constraint [hanhkhach.UK_madinhdanh]");
        String msg = ClientDatChoController.resolveDuplicateMessage(e);
        assertNotNull(msg);
        assertTrue(msg.contains("CCCD"));
        assertFalse(msg.toLowerCase().contains("uk_madinhdanh"));
    }

    @Test
    void resolveDuplicateMessage_seatConstraint() {
        Exception e = new DataIntegrityViolationException(
                "Duplicate entry '5-10' for key 'ghe_da_dat.UK_chuyenbay_ghe'");
        String msg = ClientDatChoController.resolveDuplicateMessage(e);
        assertNotNull(msg);
        assertTrue(msg.contains("Ghế"));
    }

    @Test
    void resolveDuplicateMessage_genericUnique() {
        Exception e = new DataIntegrityViolationException("Duplicate entry 'x' for key 'PRIMARY'");
        String msg = ClientDatChoController.resolveDuplicateMessage(e);
        assertNotNull(msg);
        assertFalse(msg.toLowerCase().contains("duplicate entry"));
    }

    @Test
    void resolveDuplicateMessage_nonDuplicate_returnsNull() {
        assertNull(ClientDatChoController.resolveDuplicateMessage(new RuntimeException("boom")));
    }
}
