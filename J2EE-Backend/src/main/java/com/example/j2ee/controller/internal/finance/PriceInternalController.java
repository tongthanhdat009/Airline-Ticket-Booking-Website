package com.example.j2ee.controller.internal.finance;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.GiaChuyenBay;
import com.example.j2ee.model.HangVe;
import com.example.j2ee.model.TuyenBay;
import com.example.j2ee.repository.GiaChuyenBayRepository;
import com.example.j2ee.repository.HangVeRepository;
import com.example.j2ee.repository.TuyenBayRepository;
import com.example.j2ee.service.GiaChuyenBayService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Internal API Controller for Price Management
 * Base URL: /internal/prices
 * 
 * Provides internal/admin APIs for flight price management.
 * JWT Authentication Required.
 */
@RestController
@RequestMapping("/internal/prices")
public class PriceInternalController {

    private final GiaChuyenBayService giaChuyenBayService;
    private final GiaChuyenBayRepository giaChuyenBayRepository;
    private final TuyenBayRepository tuyenBayRepository;
    private final HangVeRepository hangVeRepository;

    public PriceInternalController(GiaChuyenBayService giaChuyenBayService,
                                    GiaChuyenBayRepository giaChuyenBayRepository,
                                    TuyenBayRepository tuyenBayRepository,
                                    HangVeRepository hangVeRepository) {
        this.giaChuyenBayService = giaChuyenBayService;
        this.giaChuyenBayRepository = giaChuyenBayRepository;
        this.tuyenBayRepository = tuyenBayRepository;
        this.hangVeRepository = hangVeRepository;
    }

    // ==================== READ ENDPOINTS ====================

    /**
     * GET /internal/prices - Get all flight prices
     */
    @GetMapping
    @RequirePermission(feature = "PRICE", action = "VIEW")
    public ResponseEntity<ApiResponse<List<GiaChuyenBay>>> getAllPrices() {
        try {
            List<GiaChuyenBay> prices = giaChuyenBayService.getAllGiaChuyenBay();
            return ResponseEntity.ok(
                    ApiResponse.success("Lấy danh sách giá chuyến bay thành công", prices));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách giá chuyến bay: " + e.getMessage()));
        }
    }

    /**
     * GET /internal/prices/{id} - Get price by ID
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "PRICE", action = "VIEW")
    public ResponseEntity<ApiResponse<GiaChuyenBay>> getPriceById(@PathVariable int id) {
        try {
            GiaChuyenBay price = giaChuyenBayRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giá chuyến bay với ID: " + id));
            return ResponseEntity.ok(
                    ApiResponse.success("Lấy thông tin giá chuyến bay thành công", price));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thông tin giá chuyến bay: " + e.getMessage()));
        }
    }

    /**
     * GET /internal/prices/routes/{routeId} - Get prices by route
     */
    @GetMapping("/routes/{routeId}")
    @RequirePermission(feature = "PRICE", action = "VIEW")
    public ResponseEntity<ApiResponse<List<GiaChuyenBay>>> getPricesByRoute(@PathVariable int routeId) {
        try {
            List<GiaChuyenBay> prices = giaChuyenBayRepository.findByTuyenBay_MaTuyenBay(routeId);
            return ResponseEntity.ok(
                    ApiResponse.success("Lấy giá theo tuyến bay thành công", prices));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy giá theo tuyến bay: " + e.getMessage()));
        }
    }

    // ==================== CREATE ENDPOINTS ====================

    /**
     * POST /internal/prices - Create new price
     */
    @PostMapping
    @RequirePermission(feature = "PRICE", action = "CREATE")
    public ResponseEntity<ApiResponse<GiaChuyenBay>> createPrice(@RequestBody Map<String, Object> payload) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> tuyenBayMap = (Map<String, Object>) payload.get("tuyenBay");
            @SuppressWarnings("unchecked")
            Map<String, Object> hangVeMap = (Map<String, Object>) payload.get("hangVe");

            int maTuyenBay = (int) tuyenBayMap.get("maTuyenBay");
            int maHangVe = (int) hangVeMap.get("maHangVe");

            TuyenBay tuyenBay = tuyenBayRepository.findById(maTuyenBay)
                    .orElseThrow(() -> new IllegalArgumentException("Tuyến bay không tồn tại với mã: " + maTuyenBay));

            HangVe hangVe = hangVeRepository.findById(maHangVe)
                    .orElseThrow(() -> new IllegalArgumentException("Hạng vé không tồn tại với mã: " + maHangVe));

            BigDecimal giaVe = parseBigDecimal(payload.get("giaVe"));
            LocalDate ngayApDungTu = parseLocalDate((String) payload.get("ngayApDungTu"));

            LocalDate ngayApDungDen = null;
            String ngayApDungDenStr = (String) payload.get("ngayApDungDen");
            if (ngayApDungDenStr != null && !ngayApDungDenStr.isEmpty()) {
                ngayApDungDen = parseLocalDate(ngayApDungDenStr);
            }

            GiaChuyenBay savedPrice = giaChuyenBayService.themGia(
                    tuyenBay,
                    hangVe,
                    giaVe,
                    ngayApDungTu,
                    ngayApDungDen);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Thêm giá chuyến bay thành công", savedPrice));

        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi thêm giá chuyến bay: " + e.getMessage()));
        }
    }

    // ==================== UPDATE ENDPOINTS ====================

    /**
     * PUT /internal/prices/{id} - Update price
     */
    @PutMapping("/{id}")
    @RequirePermission(feature = "PRICE", action = "UPDATE")
    public ResponseEntity<ApiResponse<GiaChuyenBay>> updatePrice(
            @PathVariable int id,
            @RequestBody Map<String, Object> payload) {
        try {
            GiaChuyenBay giaChuyenBay = giaChuyenBayRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giá chuyến bay với ID: " + id));

            BigDecimal giaVe = parseBigDecimal(payload.get("giaVe"));
            LocalDate ngayApDungTu = parseLocalDate((String) payload.get("ngayApDungTu"));

            LocalDate ngayApDungDen = null;
            String ngayApDungDenStr = (String) payload.get("ngayApDungDen");
            if (ngayApDungDenStr != null && !ngayApDungDenStr.isEmpty()) {
                ngayApDungDen = parseLocalDate(ngayApDungDenStr);
            }

            GiaChuyenBay updatedPrice = giaChuyenBayService.suaGia(
                    giaChuyenBay,
                    giaVe,
                    ngayApDungTu,
                    ngayApDungDen);

            return ResponseEntity.ok(
                    ApiResponse.success("Cập nhật giá chuyến bay thành công", updatedPrice));

        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi cập nhật giá chuyến bay: " + e.getMessage()));
        }
    }

    // ==================== DELETE ENDPOINTS ====================

    /**
     * DELETE /internal/prices/{id} - Delete price
     */
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "PRICE", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deletePrice(@PathVariable int id) {
        try {
            if (!giaChuyenBayRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy giá chuyến bay với ID: " + id));
            }

            giaChuyenBayService.xoaGia(id);

            return ResponseEntity.ok(
                    ApiResponse.successMessage("Xóa giá chuyến bay thành công"));

        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi xóa giá chuyến bay: " + e.getMessage()));
        }
    }

    // ==================== HELPER METHODS ====================

    private BigDecimal parseBigDecimal(Object value) {
        if (value == null) {
            throw new IllegalArgumentException("Giá vé không được để trống");
        }
        if (value instanceof Integer) {
            return BigDecimal.valueOf((Integer) value);
        } else if (value instanceof Double) {
            return BigDecimal.valueOf((Double) value);
        } else if (value instanceof String) {
            return new BigDecimal((String) value);
        } else if (value instanceof BigDecimal) {
            return (BigDecimal) value;
        }
        throw new IllegalArgumentException("Định dạng giá vé không hợp lệ");
    }

    private LocalDate parseLocalDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            throw new IllegalArgumentException("Ngày áp dụng từ không được để trống");
        }
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            return LocalDate.parse(dateStr, formatter);
        } catch (Exception e) {
            throw new IllegalArgumentException("Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng yyyy-MM-dd");
        }
    }
}
