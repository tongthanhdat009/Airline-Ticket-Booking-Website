package com.example.j2ee.service;

import com.example.j2ee.model.ChiTietChuyenBay;
import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.DonHang;
import com.example.j2ee.model.HanhKhach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class OdooSyncServiceTest {

    @Test
    void testBuildDirectPayload_ContractShape() {
        HanhKhach hk = new HanhKhach();
        hk.setHoVaTen("Nguyen Van A");

        ChiTietChuyenBay cb = new ChiTietChuyenBay();
        cb.setMaChuyenBay(7);

        DatCho dc = new DatCho();
        dc.setChuyenBay(cb);
        dc.setGiaVe(new BigDecimal("1500000"));

        DonHang dh = new DonHang();
        dh.setMaDonHang(1);
        dh.setPnr("ABC123");
        dh.setHanhKhachNguoiDat(hk);
        dh.setEmailNguoiDat("a@mail.com");
        dh.setSoDienThoaiNguoiDat("0901");
        Set<DatCho> bookings = new HashSet<>();
        bookings.add(dc);
        dh.setDanhSachDatCho(bookings);

        Map<String, Object> payload = OdooHookService.buildDirectPayload(dh);

        assertEquals("airline", payload.get("channel_code"));
        assertEquals("ABC123", payload.get("external_id"));
        assertEquals("internal", payload.get("payment_method"));
        Map<?, ?> customer = (Map<?, ?>) payload.get("customer");
        assertEquals("Nguyen Van A", customer.get("name"));
        assertEquals("a@mail.com", customer.get("email"));
        List<?> items = (List<?>) payload.get("items");
        assertEquals(1, items.size());
        Map<?, ?> item = (Map<?, ?>) items.get(0);
        assertEquals("FLIGHT-7-?", item.get("sku"));
        assertEquals(1, item.get("qty"));
        assertEquals(1500000L, item.get("price_vnd"));
    }

    @Test
    void testBuildDirectPayload_EmptyBookings() {
        DonHang dh = new DonHang();
        dh.setPnr("ZZZ999");
        dh.setDanhSachDatCho(new HashSet<>());

        Map<String, Object> payload = OdooHookService.buildDirectPayload(dh);

        assertEquals("ZZZ999", payload.get("external_id"));
        assertTrue(((List<?>) payload.get("items")).isEmpty());
    }
}
