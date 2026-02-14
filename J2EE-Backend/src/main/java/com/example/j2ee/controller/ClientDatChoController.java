package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.datcho.CreateBookingRequest;
import com.example.j2ee.dto.datcho.CreateBookingResponse;
import com.example.j2ee.dto.datcho.DatChoDetailResponse;
import com.example.j2ee.dto.datcho.DatChoSearchRequest;
import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.DonHang;
import com.example.j2ee.model.HanhKhach;
import com.example.j2ee.model.ChiTietGhe;
import com.example.j2ee.model.TrangThaiThanhToan;
import com.example.j2ee.repository.DatChoRepository;
import com.example.j2ee.repository.DonHangRepository;
import com.example.j2ee.repository.HanhKhachRepository;
import com.example.j2ee.repository.ChiTietGheRepository;
import com.example.j2ee.repository.TrangThaiThanhToanRepository;
import com.example.j2ee.repository.GheDaDatRepository;
import com.example.j2ee.service.DatChoService;
import com.example.j2ee.service.HanhKhachService;
import com.example.j2ee.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/client/datcho")
@RequiredArgsConstructor
public class ClientDatChoController {

    private final DatChoService datChoService;
    private final DatChoRepository datChoRepository;
    private final DonHangRepository donHangRepository;
    private final HanhKhachRepository hanhKhachRepository;
    private final ChiTietGheRepository chiTietGheRepository;
    private final TrangThaiThanhToanRepository trangThaiThanhToanRepository;
    private final GheDaDatRepository gheDaDatRepository;
    private final HanhKhachService hanhKhachService;
    private final BookingService bookingService;

    /**
     * Lấy danh sách đặt chỗ của hành khách theo mã hành khách
     */
    @GetMapping("/hanhkhach/{maHanhKhach}")
    public ResponseEntity<ApiResponse<List<DatCho>>> getDatChoByHanhKhach(@PathVariable int maHanhKhach) {
        try {
            List<DatCho> danhSachDatCho = datChoService.getDatChoByHanhKhach(maHanhKhach);
            return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách đặt chỗ thành công", danhSachDatCho)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi lấy danh sách đặt chỗ: " + e.getMessage()));
        }
    }

    /**
     * Lấy chi tiết đặt chỗ theo mã đặt chỗ
     */
    @GetMapping("/{maDatCho}")
    public ResponseEntity<ApiResponse<DatCho>> getDatChoById(@PathVariable int maDatCho) {
        try {
            DatCho datCho = datChoService.getDatChoById(maDatCho)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đặt chỗ"));
            
            return ResponseEntity.ok(
                ApiResponse.success("Lấy chi tiết đặt chỗ thành công", datCho)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi lấy chi tiết đặt chỗ: " + e.getMessage()));
        }
    }

    /**
     * Hủy đặt chỗ (xóa đặt chỗ và các giao dịch liên quan)
     */
    @DeleteMapping("/{maDatCho}")
    public ResponseEntity<ApiResponse<Void>> huyDatCho(@PathVariable int maDatCho) {
        try {
            datChoService.huyDatCho(maDatCho);
            return ResponseEntity.ok(ApiResponse.successMessage("Hủy đặt chỗ thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi hủy đặt chỗ: " + e.getMessage()));
        }
    }

    /**
     * Tìm kiếm đặt chỗ theo mã đặt chỗ và tên hành khách
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<DatChoDetailResponse>> searchDatCho(
            @Valid @ModelAttribute DatChoSearchRequest request) {
        try {
            DatChoDetailResponse response = datChoService.searchDatCho(
                request.getMaDatCho(), 
                request.getTenHanhKhach()
            );
            
            return ResponseEntity.ok(
                ApiResponse.success("Tìm kiếm thành công", response)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi tìm kiếm: " + e.getMessage()));
        }
    }

    /**
     * Tạo đặt chỗ mới với thông tin hành khách và thanh toán
     * Hỗ trợ đặt cho nhiều hành khách cùng lúc
     * Logic nghiệp vụ đã được chuyển sang BookingService
     */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<CreateBookingResponse>> createBooking(
            @Valid @RequestBody CreateBookingRequest request) {
        try {
            // Delegate business logic sang BookingService
            CreateBookingResponse response = bookingService.createBooking(request);
            
            return ResponseEntity.ok(
                ApiResponse.success(
                    "Tạo đặt chỗ thành công cho " + response.getDanhSachMaDatCho().size() + " hành khách", 
                    response
                )
            );
        } catch (IllegalArgumentException e) {
            // Business validation errors (ghế đã đặt, số lượng không khớp, etc.)
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            // Unexpected errors
            e.printStackTrace(); // Log for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi tạo đặt chỗ: " + e.getMessage()));
        }
    }
}
