package com.example.j2ee.controller;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.GiaChuyenBay;
import com.example.j2ee.model.HangVe;
import com.example.j2ee.model.TuyenBay;
import com.example.j2ee.repository.GiaChuyenBayRepository;
import com.example.j2ee.repository.HangVeRepository;
import com.example.j2ee.repository.TuyenBayRepository;
import com.example.j2ee.service.GiaChuyenBayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/admin/dashboard/giachuyenbay")
@RequiredArgsConstructor
public class GiaChuyenBayController {

    private final GiaChuyenBayService giaChuyenBayService;
    private final GiaChuyenBayRepository giaChuyenBayRepository;
    private final TuyenBayRepository tuyenBayRepository;
    private final HangVeRepository hangVeRepository;

    // Lấy tất cả giá chuyến bay
    @GetMapping
    @RequirePermission(feature = "PRICE", action = "VIEW")
    public ResponseEntity<ApiResponse<List<GiaChuyenBay>>> getAllGiaChuyenBay() {
        try {
            List<GiaChuyenBay> danhSachGia = giaChuyenBayService.getAllGiaChuyenBay();
            return ResponseEntity.ok(
                    ApiResponse.success("Lấy danh sách giá chuyến bay thành công", danhSachGia));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách giá chuyến bay: " + e.getMessage()));
        }
    }

    // Lấy giá chuyến bay theo ID
    @GetMapping("/{id}")
    @RequirePermission(feature = "PRICE", action = "VIEW")
    public ResponseEntity<ApiResponse<GiaChuyenBay>> getGiaChuyenBayById(@PathVariable int id) {
        try {
            GiaChuyenBay giaChuyenBay = giaChuyenBayRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giá chuyến bay với ID: " + id));
            return ResponseEntity.ok(
                    ApiResponse.success("Lấy thông tin giá chuyến bay thành công", giaChuyenBay));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thông tin giá chuyến bay: " + e.getMessage()));
        }
    }

    // Lấy giá theo tuyến bay
    @GetMapping("/tuyenbay/{maTuyenBay}")
    @RequirePermission(feature = "PRICE", action = "VIEW")
    public ResponseEntity<ApiResponse<List<GiaChuyenBay>>> getGiaByTuyenBay(@PathVariable int maTuyenBay) {
        try {
            List<GiaChuyenBay> danhSachGia = giaChuyenBayRepository.findByTuyenBay_MaTuyenBay(maTuyenBay);
            return ResponseEntity.ok(
                    ApiResponse.success("Lấy giá theo tuyến bay thành công", danhSachGia));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy giá theo tuyến bay: " + e.getMessage()));
        }
    }

    // Thêm giá chuyến bay mới - Sử dụng Service layer
    @PostMapping
    @RequirePermission(feature = "PRICE", action = "CREATE")
    public ResponseEntity<ApiResponse<GiaChuyenBay>> createGiaChuyenBay(@RequestBody Map<String, Object> payload) {
        try {
            // Lấy thông tin từ payload
            @SuppressWarnings("unchecked")
            Map<String, Object> tuyenBayMap = (Map<String, Object>) payload.get("tuyenBay");
            @SuppressWarnings("unchecked")
            Map<String, Object> hangVeMap = (Map<String, Object>) payload.get("hangVe");

            int maTuyenBay = (int) tuyenBayMap.get("maTuyenBay");
            int maHangVe = (int) hangVeMap.get("maHangVe");

            // Kiểm tra tuyến bay có tồn tại không
            TuyenBay tuyenBay = tuyenBayRepository.findById(maTuyenBay)
                    .orElseThrow(() -> new IllegalArgumentException("Tuyến bay không tồn tại với mã: " + maTuyenBay));

            // Kiểm tra hạng vé có tồn tại không
            HangVe hangVe = hangVeRepository.findById(maHangVe)
                    .orElseThrow(() -> new IllegalArgumentException("Hạng vé không tồn tại với mã: " + maHangVe));

            // Xử lý giá vé
            BigDecimal giaVe = parseBigDecimal(payload.get("giaVe"));

            // Xử lý ngày áp dụng
            LocalDate ngayApDungTu = parseLocalDate((String) payload.get("ngayApDungTu"));

            // Ngày áp dụng đến có thể null
            LocalDate ngayApDungDen = null;
            String ngayApDungDenStr = (String) payload.get("ngayApDungDen");
            if (ngayApDungDenStr != null && !ngayApDungDenStr.isEmpty()) {
                ngayApDungDen = parseLocalDate(ngayApDungDenStr);
            }

            // Gọi service để thêm giá (có validation chồng lấn)
            GiaChuyenBay savedGia = giaChuyenBayService.themGia(
                    tuyenBay,
                    hangVe,
                    giaVe,
                    ngayApDungTu,
                    ngayApDungDen);

            return ResponseEntity.ok(
                    ApiResponse.success("Thêm giá chuyến bay thành công", savedGia));

        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi thêm giá chuyến bay: " + e.getMessage()));
        }
    }

    // Cập nhật giá chuyến bay - Sử dụng Service layer
    @PutMapping("/{id}")
    @RequirePermission(feature = "PRICE", action = "UPDATE")
    public ResponseEntity<ApiResponse<GiaChuyenBay>> updateGiaChuyenBay(
            @PathVariable int id,
            @RequestBody Map<String, Object> payload) {
        try {
            // Kiểm tra giá chuyến bay có tồn tại không
            GiaChuyenBay giaChuyenBay = giaChuyenBayRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giá chuyến bay với ID: " + id));

            // Xử lý giá vé
            BigDecimal giaVe = parseBigDecimal(payload.get("giaVe"));

            // Xử lý ngày áp dụng
            LocalDate ngayApDungTu = parseLocalDate((String) payload.get("ngayApDungTu"));

            // Ngày áp dụng đến có thể null
            LocalDate ngayApDungDen = null;
            String ngayApDungDenStr = (String) payload.get("ngayApDungDen");
            if (ngayApDungDenStr != null && !ngayApDungDenStr.isEmpty()) {
                ngayApDungDen = parseLocalDate(ngayApDungDenStr);
            }

            // Gọi service để cập nhật (có validation chồng lấn)
            GiaChuyenBay updatedGia = giaChuyenBayService.suaGia(
                    giaChuyenBay,
                    giaVe,
                    ngayApDungTu,
                    ngayApDungDen);

            return ResponseEntity.ok(
                    ApiResponse.success("Cập nhật giá chuyến bay thành công", updatedGia));

        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi cập nhật giá chuyến bay: " + e.getMessage()));
        }
    }

    // Xóa giá chuyến bay - Sử dụng Service layer (có validation)
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "PRICE", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteGiaChuyenBay(@PathVariable int id) {
        try {
            if (!giaChuyenBayRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy giá chuyến bay với ID: " + id));
            }

            // Gọi service để xóa (có validation không cho xóa giá đang áp dụng)
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

    // Helper method: Parse BigDecimal từ Object
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

    // Helper method: Parse LocalDate từ string
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
