package com.example.j2ee.controller.internal.ticketing;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.datcho.DoiChuyenBayRequest;
import com.example.j2ee.dto.datcho.DoiGheRequest;
import com.example.j2ee.dto.datcho.DoiHangVeRequest;
import com.example.j2ee.dto.datcho.DoiHangVeResponse;
import com.example.j2ee.dto.datcho.DatChoAdminResponse;
import com.example.j2ee.dto.datcho.DatChoFilterRequest;
import com.example.j2ee.model.ChiTietChuyenBay;
import com.example.j2ee.model.ChiTietGhe;
import com.example.j2ee.model.DatChoDichVu;
import com.example.j2ee.service.QuanLyDatChoService;
import com.example.j2ee.repository.ChiTietChuyenBayRepository;
import com.example.j2ee.repository.ChiTietGheRepository;
import com.example.j2ee.repository.DatChoDichVuRepository;
import com.example.j2ee.repository.GheDaDatRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Internal API Controller for Booking Management
 * Base URL: /internal/bookings
 * 
 * Provides internal/admin APIs for booking management.
 * JWT Authentication Required.
 */
@RestController
@RequestMapping("/internal/bookings")
@Tag(name = "Booking Management", description = "Internal APIs for booking management")
public class BookingInternalController {

    @Autowired
    private QuanLyDatChoService quanLyDatChoService;
    
    @Autowired
    private ChiTietChuyenBayRepository chuyenBayRepository;
    
    @Autowired
    private ChiTietGheRepository chiTietGheRepository;
    
    @Autowired
    private GheDaDatRepository gheDaDatRepository;
    
    @Autowired
    private DatChoDichVuRepository datChoDichVuRepository;

    // ==================== READ ENDPOINTS ====================

    /**
     * GET /internal/bookings - Get all bookings with filter and pagination
     */
    @GetMapping
    @RequirePermission(feature = "BOOKING", action = "VIEW")
    @Operation(summary = "Get all bookings", description = "Requires BOOKING_VIEW permission")
    public ResponseEntity<ApiResponse<Page<DatChoAdminResponse>>> getAllBookings(
            @Parameter(description = "Flight ID")
            @RequestParam(required = false) Integer maChuyenBay,
            
            @Parameter(description = "Booking status (ACTIVE, CANCELLED)")
            @RequestParam(required = false) String trangThai,
            
            @Parameter(description = "From date (yyyy-MM-dd)")
            @RequestParam(required = false) LocalDate tuNgay,
            
            @Parameter(description = "To date (yyyy-MM-dd)")
            @RequestParam(required = false) LocalDate denNgay,
            
            @Parameter(description = "Search keyword")
            @RequestParam(required = false) String search,
            
            @Parameter(description = "Page number (starts from 0)")
            @RequestParam(defaultValue = "0") int page,
            
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size) {
        
        DatChoFilterRequest filters = DatChoFilterRequest.builder()
                .maChuyenBay(maChuyenBay)
                .trangThai(trangThai)
                .tuNgay(tuNgay)
                .denNgay(denNgay)
                .search(search)
                .page(page)
                .size(size)
                .build();
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("ngayDatCho").descending());
        Page<DatChoAdminResponse> result = quanLyDatChoService.getAllDatCho(filters, pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đặt chỗ thành công", result));
    }

    /**
     * GET /internal/bookings/{id} - Get booking by ID
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "BOOKING", action = "VIEW")
    @Operation(summary = "Get booking details", description = "Requires BOOKING_VIEW permission")
    public ResponseEntity<ApiResponse<DatChoAdminResponse>> getBookingById(
            @Parameter(description = "Booking ID")
            @PathVariable int id) {
        
        DatChoAdminResponse response = quanLyDatChoService.getDatChoById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết đặt chỗ thành công", response));
    }

    /**
     * GET /internal/bookings/{id}/available-flights - Get available flights for change
     */
    @GetMapping("/{id}/available-flights")
    @RequirePermission(feature = "BOOKING", action = "VIEW")
    @Operation(summary = "Get available flights for change", description = "Requires BOOKING_VIEW permission")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableFlightsForChange(
            @Parameter(description = "Booking ID")
            @PathVariable int id) {
        
        DatChoAdminResponse datCho = quanLyDatChoService.getDatChoById(id);
        
        ChiTietChuyenBay currentFlight = chuyenBayRepository.findById(datCho.getMaChuyenBay())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chuyến bay"));
        
        int maSanBayDi = currentFlight.getTuyenBay().getSanBayDi().getMaSanBay();
        int maSanBayDen = currentFlight.getTuyenBay().getSanBayDen().getMaSanBay();
        
        List<ChiTietChuyenBay> availableFlights = chuyenBayRepository.findAvailableFlightsForChange(
                maSanBayDi,
                maSanBayDen,
                LocalDate.now(),
                LocalTime.now(),
                datCho.getMaChuyenBay()
        );
        
        List<Map<String, Object>> result = availableFlights.stream().map(flight -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("maChuyenBayId", flight.getMaChuyenBay());
            map.put("maChuyenBay", flight.getSoHieuChuyenBay());
            map.put("sanBayDi", flight.getTuyenBay().getSanBayDi().getTenSanBay());
            map.put("maSanBayDi", flight.getTuyenBay().getSanBayDi().getMaIATA());
            map.put("sanBayDen", flight.getTuyenBay().getSanBayDen().getTenSanBay());
            map.put("maSanBayDen", flight.getTuyenBay().getSanBayDen().getMaIATA());
            map.put("ngayDi", flight.getNgayDi());
            map.put("gioDi", flight.getGioDi());
            map.put("ngayDen", flight.getNgayDen());
            map.put("gioDen", flight.getGioDen());
            map.put("trangThai", flight.getTrangThai());
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách chuyến bay thành công", result));
    }

    /**
     * GET /internal/bookings/{id}/seat-map - Get seat map for booking
     */
    @GetMapping("/{id}/seat-map")
    @RequirePermission(feature = "BOOKING", action = "VIEW")
    @Operation(summary = "Get seat map", description = "Requires BOOKING_VIEW permission")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSeatMap(
            @Parameter(description = "Booking ID")
            @PathVariable int id) {
        
        DatChoAdminResponse datCho = quanLyDatChoService.getDatChoById(id);
        
        ChiTietChuyenBay chuyenBay = chuyenBayRepository.findById(datCho.getMaChuyenBay())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chuyến bay"));
        
        List<ChiTietGhe> allSeats = chiTietGheRepository.findByMayBay_MaMayBay(
                chuyenBay.getMayBay().getMaMayBay());
        
        List<Integer> bookedSeatIds = gheDaDatRepository.findByChuyenBay_MaChuyenBay(datCho.getMaChuyenBay())
                .stream()
                .filter(gdd -> !"CANCELLED".equals(gdd.getDatCho().getTrangThai()))
                .map(gdd -> gdd.getGhe().getMaGhe())
                .collect(Collectors.toList());
        
        List<Map<String, Object>> seatMap = allSeats.stream().map(ghe -> {
            Map<String, Object> seat = new java.util.HashMap<>();
            seat.put("maGhe", ghe.getMaGhe());
            seat.put("soGhe", ghe.getSoGhe());
            seat.put("hang", ghe.getHang());
            seat.put("cot", ghe.getCot());
            seat.put("viTriGhe", ghe.getViTriGhe());
            seat.put("tenHangVe", ghe.getHangVe() != null ? ghe.getHangVe().getTenHangVe() : null);
            seat.put("maHangVe", ghe.getHangVe() != null ? ghe.getHangVe().getMaHangVe() : null);
            seat.put("isBooked", bookedSeatIds.contains(ghe.getMaGhe()));
            seat.put("isCurrentSeat", ghe.getMaGhe() == (datCho.getMaGhe() != null ? datCho.getMaGhe() : 0));
            seat.put("loaiViTri", determineSeatPosition(ghe.getViTriGhe()));
            return seat;
        }).collect(Collectors.toList());
        
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("maChuyenBay", datCho.getMaChuyenBay());
        result.put("soHieuChuyenBay", datCho.getSoHieuChuyenBay());
        result.put("currentSeatId", datCho.getMaGhe());
        result.put("currentSeatNumber", datCho.getSoGhe());
        result.put("seats", seatMap);
        
        return ResponseEntity.ok(ApiResponse.success("Lấy sơ đồ ghế thành công", result));
    }

    /**
     * GET /internal/bookings/{id}/upgrade-fee - Calculate upgrade fee
     */
    @GetMapping("/{id}/upgrade-fee")
    @RequirePermission(feature = "BOOKING", action = "VIEW")
    @Operation(summary = "Calculate upgrade fee", description = "Requires BOOKING_VIEW permission")
    public ResponseEntity<ApiResponse<DoiHangVeResponse>> calculateUpgradeFee(
            @Parameter(description = "Booking ID")
            @PathVariable int id,
            @Parameter(description = "New ticket class ID")
            @RequestParam int maHangVeMoi) {
        
        DoiHangVeResponse response = quanLyDatChoService.tinhPhiDoiHangVe(id, maHangVeMoi);
        return ResponseEntity.ok(ApiResponse.success("Tính phí đổi hạng vé thành công", response));
    }

    /**
     * GET /internal/bookings/{id}/services - Get booked services for a booking
     */
    @GetMapping("/{id}/services")
    @RequirePermission(feature = "BOOKING", action = "VIEW")
    @Operation(summary = "Get booked services", description = "Requires BOOKING_VIEW permission")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getBookingServices(
            @Parameter(description = "Booking ID")
            @PathVariable int id) {
        try {
            List<DatChoDichVu> danhSachDichVu = datChoDichVuRepository.findByDatCho_MaDatCho(id);
            
            List<Map<String, Object>> response = new ArrayList<>();
            
            for (DatChoDichVu dcdv : danhSachDichVu) {
                Map<String, Object> dichVuMap = new HashMap<>();
                dichVuMap.put("soLuong", dcdv.getSoLuong());
                dichVuMap.put("donGia", dcdv.getDonGia());
                
                if (dcdv.getLuaChonDichVu() != null) {
                    Map<String, Object> luaChonMap = new HashMap<>();
                    luaChonMap.put("maLuaChon", dcdv.getLuaChonDichVu().getMaLuaChon());
                    luaChonMap.put("tenLuaChon", dcdv.getLuaChonDichVu().getTenLuaChon());
                    luaChonMap.put("moTa", dcdv.getLuaChonDichVu().getMoTa());
                    luaChonMap.put("gia", dcdv.getLuaChonDichVu().getGia());
                    luaChonMap.put("anh", dcdv.getLuaChonDichVu().getAnh());
                    
                    if (dcdv.getLuaChonDichVu().getDichVuCungCap() != null) {
                        Map<String, Object> dichVuCungCapMap = new HashMap<>();
                        dichVuCungCapMap.put("maDichVu", dcdv.getLuaChonDichVu().getDichVuCungCap().getMaDichVu());
                        dichVuCungCapMap.put("tenDichVu", dcdv.getLuaChonDichVu().getDichVuCungCap().getTenDichVu());
                        dichVuCungCapMap.put("moTa", dcdv.getLuaChonDichVu().getDichVuCungCap().getMoTa());
                        dichVuCungCapMap.put("anh", dcdv.getLuaChonDichVu().getDichVuCungCap().getAnh());
                        
                        luaChonMap.put("dichVu", dichVuCungCapMap);
                    }
                    
                    dichVuMap.put("luaChonDichVu", luaChonMap);
                }
                
                response.add(dichVuMap);
            }
            
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách dịch vụ thành công", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi lấy danh sách dịch vụ: " + e.getMessage()));
        }
    }

    // ==================== UPDATE ENDPOINTS ====================

    /**
     * PUT /internal/bookings/{id}/change-seat - Change seat
     */
    @PutMapping("/{id}/change-seat")
    @RequirePermission(feature = "BOOKING", action = "UPDATE")
    @Operation(summary = "Change seat", description = "Requires BOOKING_UPDATE permission")
    public ResponseEntity<ApiResponse<DatChoAdminResponse>> changeSeat(
            @Parameter(description = "Booking ID")
            @PathVariable int id,
            @Valid @RequestBody DoiGheRequest request) {
        
        DatChoAdminResponse response = quanLyDatChoService.doiGhe(id, request);
        return ResponseEntity.ok(ApiResponse.success("Đổi ghế thành công", response));
    }

    /**
     * PUT /internal/bookings/{id}/change-flight - Change flight
     */
    @PutMapping("/{id}/change-flight")
    @RequirePermission(feature = "BOOKING", action = "UPDATE")
    @Operation(summary = "Change flight", description = "Requires BOOKING_UPDATE permission")
    public ResponseEntity<ApiResponse<DatChoAdminResponse>> changeFlight(
            @Parameter(description = "Booking ID")
            @PathVariable int id,
            @Valid @RequestBody DoiChuyenBayRequest request) {
        
        try {
            DatChoAdminResponse response = quanLyDatChoService.doiChuyenBay(id, request);
            return ResponseEntity.ok(ApiResponse.success("Đổi chuyến bay thành công", response));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * PUT /internal/bookings/{id}/checkin - Admin check-in
     */
    @PutMapping("/{id}/checkin")
    @RequirePermission(feature = "BOOKING", action = "UPDATE")
    @Operation(summary = "Admin check-in", description = "Requires BOOKING_UPDATE permission")
    public ResponseEntity<ApiResponse<DatChoAdminResponse>> adminCheckIn(
            @Parameter(description = "Booking ID")
            @PathVariable int id) {
        
        DatChoAdminResponse response = quanLyDatChoService.adminCheckIn(id);
        return ResponseEntity.ok(ApiResponse.success("Check-in thành công", response));
    }

    /**
     * PUT /internal/bookings/{id}/upgrade - Upgrade ticket class
     */
    @PutMapping("/{id}/upgrade")
    @RequirePermission(feature = "BOOKING", action = "UPDATE")
    @Operation(summary = "Upgrade ticket class", description = "Requires BOOKING_UPDATE permission")
    public ResponseEntity<ApiResponse<DoiHangVeResponse>> upgradeTicketClass(
            @Parameter(description = "Booking ID")
            @PathVariable int id,
            @Valid @RequestBody DoiHangVeRequest request) {
        
        DoiHangVeResponse response = quanLyDatChoService.doiHangVe(id, request);
        return ResponseEntity.ok(ApiResponse.success("Đổi hạng vé thành công", response));
    }

    // ==================== DELETE ENDPOINTS ====================

    /**
     * DELETE /internal/bookings/{id} - Cancel booking
     */
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "BOOKING", action = "DELETE")
    @Operation(summary = "Cancel booking", description = "Requires BOOKING_DELETE permission")
    public ResponseEntity<ApiResponse<Void>> cancelBooking(
            @Parameter(description = "Booking ID")
            @PathVariable int id,
            @Parameter(description = "Cancellation reason")
            @RequestParam(required = false) String lyDo) {
        
        quanLyDatChoService.huyDatCho(id, lyDo);
        return ResponseEntity.ok(ApiResponse.success("Hủy đặt chỗ thành công", null));
    }

    // ==================== HELPER METHODS ====================

    private String determineSeatPosition(String viTriGhe) {
        if (viTriGhe == null || viTriGhe.isEmpty()) {
            return "MIDDLE";
        }
        
        String vt = viTriGhe.toUpperCase();
        if (vt.contains("WINDOW") || vt.contains("CỬA SỔ")) {
            return "WINDOW";
        } else if (vt.contains("AISLE") || vt.contains("LỐI ĐI") || vt.contains("ĐƯỜNG ĐI")) {
            return "AISLE";
        } else if (vt.contains("MIDDLE") || vt.contains("GIỮA")) {
            return "MIDDLE";
        }
        
        return "MIDDLE";
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalStateException(IllegalStateException e) {
        return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
    }
}
