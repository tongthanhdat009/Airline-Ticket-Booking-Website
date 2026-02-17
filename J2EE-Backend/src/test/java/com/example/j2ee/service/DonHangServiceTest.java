package com.example.j2ee.service;

import com.example.j2ee.dto.donhang.DonHangDetailResponse;
import com.example.j2ee.dto.donhang.DonHangResponse;
import com.example.j2ee.dto.donhang.HuyDonHangRequest;
import com.example.j2ee.dto.donhang.UpdateTrangThaiDonHangRequest;
import com.example.j2ee.model.ChiTietChuyenBay;
import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.DonHang;
import com.example.j2ee.model.HanhKhach;
import com.example.j2ee.repository.DatChoRepository;
import com.example.j2ee.repository.DonHangRepository;
import com.example.j2ee.repository.HoaDonRepository;
import com.example.j2ee.repository.TrangThaiThanhToanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

/**
 * Unit tests for DonHangService
 * Tests business logic layer for order management operations
 */
@ExtendWith(MockitoExtension.class)
class DonHangServiceTest {

    @Mock
    private DonHangRepository donHangRepository;

    @Mock
    private DatChoRepository datChoRepository;

    @Mock
    private HoaDonRepository hoaDonRepository;

    @Mock
    private TrangThaiThanhToanRepository trangThaiThanhToanRepository;

    @InjectMocks
    private DonHangService donHangService;

    private DonHang testDonHang;
    private DatCho testDatCho;
    private HanhKhach testHanhKhach;
    private ChiTietChuyenBay testChuyenBay;

    @BeforeEach
    void setUp() {
        // Create test customer
        testHanhKhach = new HanhKhach();
        testHanhKhach.setMaHanhKhach(1);
        testHanhKhach.setHoVaTen("Nguyen Van A");
        testHanhKhach.setEmail("test@example.com");
        testHanhKhach.setSoDienThoai("0123456789");

        // Create test flight
        testChuyenBay = new ChiTietChuyenBay();
        testChuyenBay.setMaChuyenBay(1);
        testChuyenBay.setNgayDi(LocalDateTime.now().plusDays(7).toLocalDate());
        testChuyenBay.setGioDi(LocalTime.of(10, 0));

        // Create test booking
        testDatCho = new DatCho();
        testDatCho.setMaDatCho(1);
        testDatCho.setHanhKhach(testHanhKhach);
        testDatCho.setChuyenBay(testChuyenBay);
        testDatCho.setGiaVe(new BigDecimal("1000000"));
        testDatCho.setTrangThai("ACTIVE");
        testDatCho.setCheckInStatus(false);
        testDatCho.setNgayDatCho(LocalDateTime.now());

        // Create test order
        testDonHang = new DonHang();
        testDonHang.setMaDonHang(1);
        testDonHang.setPnr("ABC123");
        testDonHang.setHanhKhachNguoiDat(testHanhKhach);
        testDonHang.setNgayDat(LocalDateTime.now());
        testDonHang.setTongGia(new BigDecimal("1000000"));
        testDonHang.setTrangThai("CHỜ THANH TOÁN");
        testDonHang.setEmailNguoiDat("test@example.com");
        testDonHang.setSoDienThoaiNguoiDat("0123456789");
        testDonHang.setCreatedAt(LocalDateTime.now());

        Set<DatCho> bookings = new HashSet<>();
        bookings.add(testDatCho);
        testDonHang.setDanhSachDatCho(bookings);
    }

    // ==================== TEST: getAllDonHang with filters ====================

    @Test
    void testGetAllDonHang_WithFilters() {
        // Given
        List<DonHang> expectedOrders = List.of(testDonHang);
        when(donHangRepository.findAll(any(Specification.class), any(Sort.class))).thenReturn(expectedOrders);

        // When
        List<DonHangResponse> result = donHangService.getAllDonHang(
                "CHỜ THANH TOÁN",
                "test@example.com",
                "0123456789",
                "ABC",
                null,
                null,
                null,
                null,
                null
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("ABC123", result.get(0).getPnr());
        assertEquals("CHỜ THANH TOÁN", result.get(0).getTrangThai());
        verify(donHangRepository, times(1)).findAll(any(Specification.class), any(Sort.class));
    }

    @Test
    void testGetAllDonHang_WithSorting() {
        // Given
        DonHang order2 = new DonHang();
        order2.setMaDonHang(2);
        order2.setPnr("DEF456");
        order2.setNgayDat(LocalDateTime.now().minusDays(1));
        order2.setTongGia(new BigDecimal("2000000"));
        order2.setTrangThai("ĐÃ THANH TOÁN");
        order2.setEmailNguoiDat("test2@example.com");
        order2.setSoDienThoaiNguoiDat("0987654321");
        order2.setCreatedAt(LocalDateTime.now().minusDays(1));

        List<DonHang> orders = List.of(order2, testDonHang);
        when(donHangRepository.findAll(any(Specification.class), any(Sort.class))).thenReturn(orders);

        // When
        List<DonHangResponse> result = donHangService.getAllDonHang(
                null, null, null, null, null, null, null, null, "tongGia:asc"
        );

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(donHangRepository, times(1)).findAll(any(Specification.class), any(Sort.class));
    }

    // ==================== TEST: getDonHangById ====================

    @Test
    void testGetDonHangById_Found() {
        // Given
        when(donHangRepository.findById(1)).thenReturn(Optional.of(testDonHang));

        // When
        DonHangDetailResponse result = donHangService.getDonHangById(1);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getMaDonHang());
        assertEquals("ABC123", result.getPnr());
        assertNotNull(result.getHanhKhachNguoiDat());
        assertEquals("Nguyen Van A", result.getHanhKhachNguoiDat().getHoVaTen());
        verify(donHangRepository, times(1)).findById(1);
    }

    @Test
    void testGetDonHangById_NotFound() {
        // Given
        when(donHangRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> donHangService.getDonHangById(999)
        );

        assertTrue(exception.getMessage().contains("Không tìm thấy đơn hàng với ID: 999"));
        verify(donHangRepository, times(1)).findById(999);
    }

    // ==================== TEST: updateTrangThai ====================

    @Test
    void testUpdateTrangThai_ValidTransition() {
        // Given
        UpdateTrangThaiDonHangRequest request = new UpdateTrangThaiDonHangRequest();
        request.setTrangThai("ĐÃ THANH TOÁN");

        when(donHangRepository.findById(1)).thenReturn(Optional.of(testDonHang));
        when(donHangRepository.save(any(DonHang.class))).thenReturn(testDonHang);
        when(hoaDonRepository.findByDonHang_MaDonHang(anyInt())).thenReturn(List.of());
        when(hoaDonRepository.countHoaDonInCurrentYear()).thenReturn(0L);

        // When
        DonHangResponse result = donHangService.updateTrangThai(1, request);

        // Then
        assertNotNull(result);
        assertEquals("ĐÃ THANH TOÁN", result.getTrangThai());
        verify(donHangRepository, times(1)).save(any(DonHang.class));
    }

    @Test
    void testUpdateTrangThai_InvalidTransition() {
        // Given
        testDonHang.setTrangThai("ĐÃ HỦY");
        UpdateTrangThaiDonHangRequest request = new UpdateTrangThaiDonHangRequest();
        request.setTrangThai("ĐÃ THANH TOÁN");

        when(donHangRepository.findById(1)).thenReturn(Optional.of(testDonHang));

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> donHangService.updateTrangThai(1, request)
        );

        assertTrue(exception.getMessage().contains("Không thể chuyển từ trạng thái 'ĐÃ HỦY' sang 'ĐÃ THANH TOÁN'"));
        verify(donHangRepository, never()).save(any(DonHang.class));
    }

    // ==================== TEST: huyDonHang ====================

    @Test
    void testHuyDonHang_Success() {
        // Given
        HuyDonHangRequest request = new HuyDonHangRequest();
        request.setLyDoHuy("Khách thay đổi kế hoạch");

        when(donHangRepository.findById(1)).thenReturn(Optional.of(testDonHang));
        when(donHangRepository.save(any(DonHang.class))).thenReturn(testDonHang);
        when(datChoRepository.save(any())).thenReturn(testDatCho);

        // When
        DonHangResponse result = donHangService.huyDonHang(1, request);

        // Then
        assertNotNull(result);
        assertEquals("ĐÃ HỦY", result.getTrangThai());
        assertEquals("[Lý do hủy: Khách thay đổi kế hoạch]", testDonHang.getGhiChu());
        assertEquals("CANCELLED", testDatCho.getTrangThai());
        verify(donHangRepository, times(1)).save(any(DonHang.class));
        verify(datChoRepository, times(1)).save(any(DatCho.class));
    }

    @Test
    void testHuyDonHang_AlreadyCancelled() {
        // Given
        testDonHang.setTrangThai("ĐÃ HỦY");
        HuyDonHangRequest request = new HuyDonHangRequest();
        request.setLyDoHuy("Test");

        when(donHangRepository.findById(1)).thenReturn(Optional.of(testDonHang));

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> donHangService.huyDonHang(1, request)
        );

        assertTrue(exception.getMessage().contains("Đơn hàng đã ở trạng thái ĐÃ HỦY"));
        verify(donHangRepository, never()).save(any(DonHang.class));
    }

    @Test
    void testHuyDonHang_CheckedIn() {
        // Given
        testDatCho.setCheckInStatus(true);
        HuyDonHangRequest request = new HuyDonHangRequest();
        request.setLyDoHuy("Test");

        when(donHangRepository.findById(1)).thenReturn(Optional.of(testDonHang));

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> donHangService.huyDonHang(1, request)
        );

        assertTrue(exception.getMessage().contains("Không thể hủy đơn hàng đã có hành khách check-in"));
        verify(donHangRepository, never()).save(any(DonHang.class));
    }

    @Test
    void testHuyDonHang_FlightDeparted() {
        // Given
        testChuyenBay.setNgayDi(LocalDateTime.now().minusDays(1).toLocalDate());
        HuyDonHangRequest request = new HuyDonHangRequest();
        request.setLyDoHuy("Test");

        when(donHangRepository.findById(1)).thenReturn(Optional.of(testDonHang));

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> donHangService.huyDonHang(1, request)
        );

        assertTrue(exception.getMessage().contains("Không thể hủy đơn hàng sau khi chuyến bay đã khởi hành"));
        verify(donHangRepository, never()).save(any(DonHang.class));
    }

    // ==================== TEST: restoreDonHang ====================

    @Test
    void testRestoreDonHang_Success() {
        // Given
        testDonHang.setDaXoa(true);
        testDonHang.setDeletedAt(LocalDateTime.now());

        when(donHangRepository.findDeletedById(1)).thenReturn(Optional.of(testDonHang));
        doNothing().when(donHangRepository).restoreById(1);

        // When
        donHangService.restoreDonHang(1);

        // Then
        verify(donHangRepository, times(1)).restoreById(1);
    }

    @Test
    void testRestoreDonHang_NotDeleted() {
        // Given
        when(donHangRepository.findDeletedById(1)).thenReturn(Optional.empty());

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> donHangService.restoreDonHang(1)
        );

        assertTrue(exception.getMessage().contains("Đơn hàng chưa bị xóa"));
        verify(donHangRepository, never()).restoreById(anyInt());
    }

    @Test
    void testGetDonHangByPnr_Found() {
        // Given
        when(donHangRepository.findByPnr("ABC123")).thenReturn(Optional.of(testDonHang));

        // When
        DonHangDetailResponse result = donHangService.getDonHangByPnr("ABC123");

        // Then
        assertNotNull(result);
        assertEquals("ABC123", result.getPnr());
        verify(donHangRepository, times(1)).findByPnr("ABC123");
    }

    @Test
    void testGetDonHangByPnr_NotFound() {
        // Given
        when(donHangRepository.findByPnr("INVALID")).thenReturn(Optional.empty());

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> donHangService.getDonHangByPnr("INVALID")
        );

        assertTrue(exception.getMessage().contains("Không tìm thấy đơn hàng với PNR"));
        verify(donHangRepository, times(1)).findByPnr("INVALID");
    }
}
