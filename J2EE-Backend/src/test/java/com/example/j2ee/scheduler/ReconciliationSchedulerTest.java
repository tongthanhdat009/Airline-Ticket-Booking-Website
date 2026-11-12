package com.example.j2ee.scheduler;

import com.example.j2ee.dto.doi_soat.DoiSoatResponse;
import com.example.j2ee.service.DoiSoatGiaoDichService;
import com.example.j2ee.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit test cho ReconciliationScheduler.sendReconciliationAlert wiring.
 * Cover: lệch + có mail → gửi; lệch + thiếu mail → bỏ qua êm; khớp hết → không gửi.
 */
@ExtendWith(MockitoExtension.class)
class ReconciliationSchedulerTest {

    @Mock
    private DoiSoatGiaoDichService doiSoatGiaoDichService;

    @Mock
    private EmailService emailService;

    private ReconciliationScheduler scheduler;

    @BeforeEach
    void setUp() {
        scheduler = new ReconciliationScheduler(doiSoatGiaoDichService, emailService);
    }

    private DoiSoatResponse row(String status) {
        return DoiSoatResponse.builder().maHoaDon(1).soHoaDon("HD1").status(status).build();
    }

    @Test
    void unmatchedWithAlertEmail_sendsMail() {
        ReflectionTestUtils.setField(scheduler, "alertEmail", "ketoan@jadtairline.com");
        when(doiSoatGiaoDichService.runManualReconciliation(any()))
                .thenReturn(List.of(row("MATCHED"), row("UNMATCHED")));

        scheduler.autoReconcile();

        verify(emailService, times(1))
                .sendReconciliationAlert(eq("ketoan@jadtairline.com"), any(), eq(1L), eq(2L));
    }

    @Test
    void unmatchedWithoutAlertEmail_skipsSilently() {
        ReflectionTestUtils.setField(scheduler, "alertEmail", "");
        when(doiSoatGiaoDichService.runManualReconciliation(any()))
                .thenReturn(List.of(row("UNMATCHED")));

        scheduler.autoReconcile();

        verify(emailService, never()).sendReconciliationAlert(any(), any(), anyLong(), anyLong());
    }

    @Test
    void allMatched_noMail() {
        ReflectionTestUtils.setField(scheduler, "alertEmail", "ketoan@jadtairline.com");
        when(doiSoatGiaoDichService.runManualReconciliation(any()))
                .thenReturn(List.of(row("MATCHED")));

        scheduler.autoReconcile();

        verify(emailService, never()).sendReconciliationAlert(any(), any(), anyLong(), anyLong());
    }
}
