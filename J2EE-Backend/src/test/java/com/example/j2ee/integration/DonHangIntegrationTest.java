package com.example.j2ee.integration;

import com.example.j2ee.controller.QuanLyDonHangController;
import com.example.j2ee.dto.ApiResponse;
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
import com.example.j2ee.service.DonHangService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for DonHang Order Management
 * Tests the full flow: Controller → Service → Repository
 *
 * Test scenarios:
 * 1. Controller → Service → Repository integration
 * 2. Filter Query Integration with dynamic parameters
 * 3. Soft Delete Operations (DonHang + DatCho cascade)
 * 4. Status Update Transaction (atomic updates, rollback on error)
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DonHangIntegrationTest {

    @Autowired
    private QuanLyDonHangController controller;

    @Autowired
    private DonHangService donHangService;

    @Autowired
    private DonHangRepository donHangRepository;

    @Autowired
    private DatChoRepository datChoRepository;

    private DonHang testDonHang;
    private DatCho testDatCho;
    private HanhKhach testHanhKhach;
    private ChiTietChuyenBay testChuyenBay;

    @BeforeEach
    void setUp() {
        // Clean up database
        datChoRepository.deleteAll();
        donHangRepository.deleteAll();

        // Create test data
        testHanhKhach = new HanhKhach();
        testHanhKhach.setHoTen("Nguyen Van Test");
        testHanhKhach.setEmail("test@example.com");
        testHanhKhach.setSoDienThoai("0123456789");
        testHanhKhach.setNgaySinh(LocalDateTime.of(1990, 1, 1, 0, 0));

        testChuyenBay = new ChiTietChuyenBay();
        testChuyenBay.setNgayDi(LocalDateTime.now().plusDays(7));
        testChuyenBay.setGioDi("10:00");

        testDonHang = new DonHang();
        testDonHang.setPnr("TEST01");
        testDonHang.setHanhKhachNguoiDat(testHanhKhach);
        testDonHang.setNgayDat(LocalDateTime.now());
        testDonHang.setTongGia(new BigDecimal("1000000"));
        testDonHang.setTrangThai("CHỜ THANH TOÁN");
        testDonHang.setEmailNguoiDat("test@example.com");
        testDonHang.setSoDienThoaiNguoiDat("0123456789");

        testDatCho = new DatCho();
        testDatCho.setDonHang(testDonHang);
        testDatCho.setHanhKhach(testHanhKhach);
        testDatCho.setChuyenBay(testChuyenBay);
        testDatCho.setGiaVe(new BigDecimal("1000000"));
        testDatCho.setTrangThai("ACTIVE");
        testDatCho.setCheckInStatus(false);
        testDatCho.setNgayDatCho(LocalDateTime.now());

        Set<DatCho> bookings = new HashSet<>();
        bookings.add(testDatCho);
        testDonHang.setDanhSachDatCho(bookings);

        // Save to database
        testDonHang = donHangRepository.save(testDonHang);
    }

    // ==================== TEST 1: Controller → Service → Repository Integration ====================

    @Test
    void testControllerServiceRepositoryIntegration() {
        // Test: GET request flows through all layers correctly

        // When: Call controller endpoint
        ResponseEntity<ApiResponse<List<DonHangResponse>>> response =
                controller.getAllDonHang(null, null, null, null, null, null, null, null, null);

        // Then: Verify response flows through all layers
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertNotNull(response.getBody().getData());
        assertFalse(response.getBody().getData().isEmpty());

        // Verify data integrity from database
        DonHangResponse orderResponse = response.getBody().getData().stream()
                .filter(o -> o.getPnr().equals("TEST01"))
                .findFirst()
                .orElse(null);
        assertNotNull(orderResponse);
        assertEquals("CHỜ THANH TOÁN", orderResponse.getTrangThai());
    }

    @Test
    void testGetOrderDetailById_Integration() {
        // When: Call controller to get order details
        ResponseEntity<ApiResponse<DonHangDetailResponse>> response =
                controller.getDonHangById(testDonHang.getMaDonHang());

        // Then: Verify complete data flow with nested objects
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());

        DonHangDetailResponse detail = response.getBody().getData();
        assertNotNull(detail);
        assertEquals("TEST01", detail.getPnr());
        assertNotNull(detail.getHanhKhachNguoiDat());
        assertEquals("Nguyen Van Test", detail.getHanhKhachNguoiDat().getHoTen());
    }

    // ==================== TEST 2: Filter Query Integration ====================

    @Test
    void testFilterQueryIntegration_StatusFilter() {
        // Create another order with different status
        DonHang order2 = new DonHang();
        order2.setPnr("TEST02");
        order2.setHanhKhachNguoiDat(testHanhKhach);
        order2.setNgayDat(LocalDateTime.now());
        order2.setTongGia(new BigDecimal("2000000"));
        order2.setTrangThai("ĐÃ THANH TOÁN");
        order2.setEmailNguoiDat("paid@example.com");
        order2.setSoDienThoaiNguoiDat("0987654321");
        donHangRepository.save(order2);

        // When: Filter by status
        ResponseEntity<ApiResponse<List<DonHangResponse>>> response =
                controller.getAllDonHang("CHỜ THANH TOÁN", null, null, null, null, null, null, null, null);

        // Then: Verify filter works correctly
        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<DonHangResponse> orders = response.getBody().getData();
        assertTrue(orders.stream().allMatch(o -> o.getTrangThai().equals("CHỜ THANH TOÁN")));
    }

    @Test
    void testFilterQueryIntegration_EmailFilter() {
        // Create orders with different emails
        DonHang order2 = new DonHang();
        order2.setPnr("TEST02");
        order2.setHanhKhachNguoiDat(testHanhKhach);
        order2.setNgayDat(LocalDateTime.now());
        order2.setTongGia(new BigDecimal("2000000"));
        order2.setTrangThai("CHỜ THANH TOÁN");
        order2.setEmailNguoiDat("other@example.com");
        order2.setSoDienThoaiNguoiDat("0987654321");
        donHangRepository.save(order2);

        // When: Filter by email (case-insensitive partial match)
        ResponseEntity<ApiResponse<List<DonHangResponse>>> response =
                controller.getAllDonHang(null, "test@example.com", null, null, null, null, null, null, null);

        // Then: Verify email filter works
        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<DonHangResponse> orders = response.getBody().getData();
        assertTrue(orders.stream().allMatch(o -> o.getEmailNguoiDat().contains("test@example.com")));
    }

    @Test
    void testFilterQueryIntegration_PriceRangeFilter() {
        // Create orders with different prices
        DonHang order2 = new DonHang();
        order2.setPnr("TEST02");
        order2.setHanhKhachNguoiDat(testHanhKhach);
        order2.setNgayDat(LocalDateTime.now());
        order2.setTongGia(new BigDecimal("3000000"));
        order2.setTrangThai("CHỜ THANH TOÁN");
        order2.setEmailNguoiDat("test2@example.com");
        order2.setSoDienThoaiNguoiDat("0987654321");
        donHangRepository.save(order2);

        // When: Filter by price range
        ResponseEntity<ApiResponse<List<DonHangResponse>>> response =
                controller.getAllDonHang(null, null, null, null, null, null,
                        new BigDecimal("1500000"), new BigDecimal("5000000"), null);

        // Then: Verify price range filter works
        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<DonHangResponse> orders = response.getBody().getData();
        assertTrue(orders.stream().allMatch(o ->
                o.getTongGia().compareTo(new BigDecimal("1500000")) >= 0 &&
                o.getTongGia().compareTo(new BigDecimal("5000000")) <= 0));
    }

    // ==================== TEST 3: Soft Delete Operations ====================

    @Test
    void testSoftDeleteOperation() {
        // Given: Order exists and is not deleted
        Integer orderId = testDonHang.getMaDonHang();
        assertNotNull(donHangRepository.findById(orderId).orElse(null));

        // When: Soft delete via controller
        ResponseEntity<ApiResponse<Void>> response = controller.softDeleteDonHang(orderId);

        // Then: Verify soft delete behavior
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());

        // Verify: Order not found in normal query (soft deleted)
        DonHang deletedOrder = donHangRepository.findById(orderId).orElse(null);
        assertNull(deletedOrder, "Soft deleted order should not be found in normal query");

        // Verify: Order exists in deleted query
        DonHang foundInDeleted = donHangRepository.findDeletedById(orderId).orElse(null);
        assertNotNull(foundInDeleted, "Order should be found in deleted query");
        assertTrue(foundInDeleted.getDaXoa());
        assertNotNull(foundInDeleted.getDeletedAt());
    }

    @Test
    void testSoftDeleteCascadeToDatCho() {
        // Given: Order has bookings
        Integer orderId = testDonHang.getMaDonHang();

        // When: Soft delete order
        controller.softDeleteDonHang(orderId);

        // Then: Verify related DatCho are also soft deleted
        List<DatCho> bookings = datChoRepository.findAll();
        assertTrue(bookings.isEmpty() || bookings.stream().allMatch(dc -> dc.getDonHang() == null),
                "All related bookings should be soft deleted or inaccessible");
    }

    @Test
    void testRestoreDeletedOrder() {
        // Given: Soft delete an order
        Integer orderId = testDonHang.getMaDonHang();
        controller.softDeleteDonHang(orderId);

        // Verify order is deleted
        DonHang deleted = donHangRepository.findDeletedById(orderId).orElse(null);
        assertNotNull(deleted);
        assertTrue(deleted.getDaXoa());

        // When: Restore the order
        ResponseEntity<ApiResponse<Void>> restoreResponse = controller.restoreDonHang(orderId);

        // Then: Verify restore behavior
        assertEquals(HttpStatus.OK, restoreResponse.getStatusCode());
        assertTrue(restoreResponse.getBody().isSuccess());

        // Verify: Order is accessible again
        DonHang restored = donHangRepository.findById(orderId).orElse(null);
        assertNotNull(restored, "Restored order should be found in normal query");
        assertFalse(restored.getDaXoa());
        assertNull(restored.getDeletedAt());
    }

    // ==================== TEST 4: Status Update Transaction ====================

    @Test
    void testStatusUpdateTransaction_AtomicUpdate() {
        // Given: Order in CHỜ THANH TOÁN
        assertEquals("CHỜ THANH TOÁN", testDonHang.getTrangThai());

        UpdateTrangThaiDonHangRequest request = new UpdateTrangThaiDonHangRequest();
        request.setTrangThai("ĐÃ THANH TOÁN");

        // When: Update status
        ResponseEntity<ApiResponse<DonHangResponse>> response =
                controller.updateTrangThaiDonHang(testDonHang.getMaDonHang(), request);

        // Then: Verify atomic update
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());

        // Verify: Database has updated status
        DonHang updated = donHangRepository.findById(testDonHang.getMaDonHang()).orElse(null);
        assertNotNull(updated);
        assertEquals("ĐÃ THANH TOÁN", updated.getTrangThai());
        assertNotNull(updated.getUpdatedAt());
    }

    @Test
    void testCancelOrderTransaction_StatusAndDatChoUpdate() {
        // Given: Active order
        assertEquals("CHỜ THANH TOÁN", testDonHang.getTrangThai());
        assertEquals("ACTIVE", testDatCho.getTrangThai());

        HuyDonHangRequest request = new HuyDonHangRequest();
        request.setLyDoHuy("Khách hủy do lý do cá nhân");

        // When: Cancel order
        ResponseEntity<ApiResponse<DonHangResponse>> response =
                controller.huyDonHang(testDonHang.getMaDonHang(), request);

        // Then: Verify transactional update
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());

        // Verify: Order status updated
        DonHang cancelled = donHangRepository.findById(testDonHang.getMaDonHang()).orElse(null);
        assertNotNull(cancelled);
        assertEquals("ĐÃ HỦY", cancelled.getTrangThai());
        assertTrue(cancelled.getGhiChu().contains("Khách hủy do lý do cá nhân"));

        // Verify: All DatCho updated to CANCELLED
        List<DatCho> bookings = datChoRepository.findAll();
        assertFalse(bookings.isEmpty());
        assertTrue(bookings.stream().allMatch(dc -> "CANCELLED".equals(dc.getTrangThai())));
    }

    @Test
    void testStatusUpdate_InvalidTransitionRejected() {
        // Given: Order in CHỜ THANH TOÁN
        UpdateTrangThaiDonHangRequest request = new UpdateTrangThaiDonHangRequest();
        request.setTrangThai("INVALID_STATUS");

        // When: Try invalid status update
        ResponseEntity<ApiResponse<DonHangResponse>> response =
                controller.updateTrangThaiDonHang(testDonHang.getMaDonHang(), request);

        // Then: Verify rejected with proper error
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());

        // Verify: Database unchanged
        DonHang unchanged = donHangRepository.findById(testDonHang.getMaDonHang()).orElse(null);
        assertNotNull(unchanged);
        assertEquals("CHỜ THANH TOÁN", unchanged.getTrangThai());
    }

    @Test
    void testDeletedOrdersEndpoint_WithFilters() {
        // Given: Create and delete an order
        Integer orderId = testDonHang.getMaDonHang();
        controller.softDeleteDonHang(orderId);

        // When: Get deleted orders with email filter
        ResponseEntity<ApiResponse<List<DonHangResponse>>> response =
                controller.getDeletedDonHang(null, "test@example.com", null, null, null, null, null, null, null);

        // Then: Verify filter works on deleted orders
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().getData());
        assertTrue(response.getBody().getData().stream()
                .allMatch(o -> o.getEmailNguoiDat().contains("test@example.com")));
    }
}
