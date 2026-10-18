package com.example.j2ee.scheduler;

import com.example.j2ee.model.ChiTietChuyenBay;
import com.example.j2ee.model.DichVuCungCap;
import com.example.j2ee.model.MayBay;
import com.example.j2ee.model.TuyenBay;
import com.example.j2ee.repository.ChiTietChuyenBayRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit test cho FlightAutoGenerationScheduler (fix P0-4).
 * Cover: weekly-template, cold-start null, trùng số hiệu, trùng lịch máy bay,
 * clone kèm dịch vụ.
 */
@ExtendWith(MockitoExtension.class)
class FlightAutoGenerationSchedulerTest {

    @Mock
    private ChiTietChuyenBayRepository repository;

    private FlightAutoGenerationScheduler scheduler;
    private LocalDate today;

    @BeforeEach
    void setUp() {
        scheduler = new FlightAutoGenerationScheduler(repository);
        today = LocalDate.of(2026, 3, 2); // Thứ 2, target-7 = Thứ 2 tuần trước
    }

    private ChiTietChuyenBay template(LocalDate ngayDi, String soHieu) {
        ChiTietChuyenBay t = new ChiTietChuyenBay();
        TuyenBay tuyen = new TuyenBay();
        MayBay mayBay = new MayBay();
        mayBay.setMaMayBay(7);
        t.setTuyenBay(tuyen);
        t.setMayBay(mayBay);
        t.setSoHieuChuyenBay(soHieu);
        t.setNgayDi(ngayDi);
        t.setNgayDen(ngayDi);
        t.setGioDi(LocalTime.of(8, 0));
        t.setGioDen(LocalTime.of(10, 0));
        DichVuCungCap dv = new DichVuCungCap();
        dv.setMaDichVu(3);
        t.setDichVuCungCap(Set.of(dv));
        return t;
    }

    @Test
    void coldStart_noFlightsAnywhere_createsNothing() {
        when(repository.findByNgayDiBetween(any(), any())).thenReturn(List.of());
        when(repository.findMaxNgayDi()).thenReturn(null);

        scheduler.generateRange(today);

        verify(repository, never()).save(any());
    }

    @Test
    void clonesWeeklyTemplateWithServices() {
        LocalDate templateDate = today.minusDays(7);
        ChiTietChuyenBay t = template(templateDate, "VN123");
        // Cửa sổ chỉ chứa template tuần trước, các ngày target đều trống.
        when(repository.findByNgayDiBetween(eq(today.minusDays(7)), eq(today.plusDays(30))))
                .thenReturn(List.of(t));
        when(repository.existsBySoHieuChuyenBayAndNgayDiAndGioDiAndNgayDenAndGioDen(
                anyString(), any(), any(), any(), any())).thenReturn(false);
        when(repository.existsAircraftScheduleConflict(anyInt(), any(), any(), any(), any(), isNull()))
                .thenReturn(0L);
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        scheduler.generateRange(today);

        ArgumentCaptor<ChiTietChuyenBay> captor = ArgumentCaptor.forClass(ChiTietChuyenBay.class);
        verify(repository, atLeastOnce()).save(captor.capture());
        ChiTietChuyenBay saved = captor.getValue();
        assertEquals("Đang mở bán", saved.getTrangThai());
        assertNotNull(saved.getDichVuCungCap());
        assertEquals(1, saved.getDichVuCungCap().size());
        assertEquals(Boolean.FALSE, saved.getDaXoa());
        assertNull(saved.getDeletedAt());
    }

    @Test
    void skipsDuplicateFlightNumber() {
        LocalDate templateDate = today.minusDays(7);
        ChiTietChuyenBay t = template(templateDate, "VN999");
        when(repository.existsBySoHieuChuyenBayAndNgayDiAndGioDiAndNgayDenAndGioDen(
                anyString(), any(), any(), any(), any())).thenReturn(true);

        // cloneFlight trả false khi trùng số hiệu, không gọi save.
        assertFalse(scheduler.cloneFlight(t, today));
        verify(repository, never()).save(any());
    }

    @Test
    void skipsAircraftScheduleConflict() {
        LocalDate templateDate = today.minusDays(7);
        ChiTietChuyenBay t = template(templateDate, "VN777");
        when(repository.existsBySoHieuChuyenBayAndNgayDiAndGioDiAndNgayDenAndGioDen(
                anyString(), any(), any(), any(), any())).thenReturn(false);
        when(repository.existsAircraftScheduleConflict(anyInt(), any(), any(), any(), any(), isNull()))
                .thenReturn(2L);

        assertFalse(scheduler.cloneFlight(t, today));
        verify(repository, never()).save(any());
    }

    @Test
    void skipsDatesAlreadyHavingFlights() {
        // Ngày today đã có chuyến -> không sinh thêm cho today, nhưng vẫn sinh cho ngày khác.
        ChiTietChuyenBay existingToday = template(today, "VN001");
        ChiTietChuyenBay weeklyTemplate = template(today.minusDays(7), "VN002");
        when(repository.findByNgayDiBetween(any(), any()))
                .thenReturn(List.of(existingToday, weeklyTemplate));
        when(repository.existsBySoHieuChuyenBayAndNgayDiAndGioDiAndNgayDenAndGioDen(
                anyString(), any(), any(), any(), any())).thenReturn(false);
        when(repository.existsAircraftScheduleConflict(anyInt(), any(), any(), any(), any(), isNull()))
                .thenReturn(0L);
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        scheduler.generateRange(today);

        // Không có save nào với ngayDi == today (ngày đã có chuyến).
        ArgumentCaptor<ChiTietChuyenBay> captor = ArgumentCaptor.forClass(ChiTietChuyenBay.class);
        verify(repository, atLeastOnce()).save(captor.capture());
        assertTrue(captor.getAllValues().stream()
                .noneMatch(f -> today.equals(f.getNgayDi())));
    }
}
