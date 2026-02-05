package com.example.j2ee.controller;

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
import com.example.j2ee.service.QuanLyDatChoService;
import com.example.j2ee.repository.ChiTietChuyenBayRepository;
import com.example.j2ee.repository.ChiTietGheRepository;
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
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller quản lý đặt chỗ cho admin
 * Cung cấp API: xem danh sách, đổi ghế, đổi chuyến bay, check-in, hủy vé
 */
@RestController
@RequestMapping("/api/admin/datcho")
@Tag(name = "Quản lý đặt chỗ", description = "Admin API quản lý đặt chỗ")
public class QuanLyDatChoController {

    @Autowired
    private QuanLyDatChoService quanLyDatChoService;
    
    @Autowired
    private ChiTietChuyenBayRepository chuyenBayRepository;
    
    @Autowired
    private ChiTietGheRepository chiTietGheRepository;
    
    @Autowired
    private GheDaDatRepository gheDaDatRepository;

    /**
     * Lấy danh sách đặt chỗ với filter và phân trang
     */
    @GetMapping
    @RequirePermission(feature = "BOOKING", action = "VIEW")
    @Operation(summary = "Lấy danh sách đặt chỗ", description = "Yêu cầu quyền BOOKING_VIEW")
    public ResponseEntity<ApiResponse<Page<DatChoAdminResponse>>> getAllDatCho(
            @Parameter(description = "Mã chuyến bay")
            @RequestParam(required = false) Integer maChuyenBay,
            
            @Parameter(description = "Trạng thái đặt chỗ (ACTIVE, CANCELLED)")
            @RequestParam(required = false) String trangThai,
            
            @Parameter(description = "Từ ngày (yyyy-MM-dd)")
            @RequestParam(required = false) LocalDate tuNgay,
            
            @Parameter(description = "Đến ngày (yyyy-MM-dd)")
            @RequestParam(required = false) LocalDate denNgay,
            
            @Parameter(description = "Từ khóa tìm kiếm")
            @RequestParam(required = false) String search,
            
            @Parameter(description = "Số trang (bắt đầu từ 0)")
            @RequestParam(defaultValue = "0") int page,
            
            @Parameter(description = "Kích thước trang")
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
     * Lấy chi tiết đặt chỗ theo ID
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "BOOKING", action = "VIEW")
    @Operation(summary = "Lấy chi tiết đặt chỗ", description = "Yêu cầu quyền BOOKING_VIEW")
    public ResponseEntity<ApiResponse<DatChoAdminResponse>> getDatChoById(
            @Parameter(description = "Mã đặt chỗ")
            @PathVariable int id) {
        
        DatChoAdminResponse response = quanLyDatChoService.getDatChoById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết đặt chỗ thành công", response));
    }

    /**
     * Đổi ghế cho đặt chỗ
     */
    @PutMapping("/{id}/doi-ghe")
    @RequirePermission(feature = "BOOKING", action = "UPDATE")
    @Operation(summary = "Đổi ghế", description = "Yêu cầu quyền BOOKING_UPDATE")
    public ResponseEntity<ApiResponse<DatChoAdminResponse>> doiGhe(
            @Parameter(description = "Mã đặt chỗ")
            @PathVariable int id,
            @Valid @RequestBody DoiGheRequest request) {
        
        DatChoAdminResponse response = quanLyDatChoService.doiGhe(id, request);
        return ResponseEntity.ok(ApiResponse.success("Đổi ghế thành công", response));
    }

    /**
     * Đổi chuyến bay cho đặt chỗ
     */
    @PutMapping("/{id}/doi-chuyen-bay")
    @RequirePermission(feature = "BOOKING", action = "UPDATE")
    @Operation(summary = "Đổi chuyến bay", description = "Yêu cầu quyền BOOKING_UPDATE")
    public ResponseEntity<ApiResponse<DatChoAdminResponse>> doiChuyenBay(
            @Parameter(description = "Mã đặt chỗ")
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
     * Admin check-in cho hành khách
     */
    @PutMapping("/{id}/check-in")
    @RequirePermission(feature = "BOOKING", action = "UPDATE")
    @Operation(summary = "Admin check-in", description = "Yêu cầu quyền BOOKING_UPDATE")
    public ResponseEntity<ApiResponse<DatChoAdminResponse>> adminCheckIn(
            @Parameter(description = "Mã đặt chỗ")
            @PathVariable int id) {
        
        DatChoAdminResponse response = quanLyDatChoService.adminCheckIn(id);
        return ResponseEntity.ok(ApiResponse.success("Check-in thành công", response));
    }

    /**
     * Hủy đặt chỗ
     */
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "BOOKING", action = "DELETE")
    @Operation(summary = "Hủy đặt chỗ", description = "Yêu cầu quyền BOOKING_DELETE")
    public ResponseEntity<ApiResponse<Void>> huyDatCho(
            @Parameter(description = "Mã đặt chỗ")
            @PathVariable int id,
            @Parameter(description = "Lý do hủy")
            @RequestParam(required = false) String lyDo) {
        
        quanLyDatChoService.huyDatCho(id, lyDo);
        return ResponseEntity.ok(ApiResponse.success("Hủy đặt chỗ thành công", null));
    }

    /**
     * Handler cho IllegalStateException (ví dụ: đã check-in không thể đổi chuyến)
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalStateException(IllegalStateException e) {
        return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
    }

    /**
     * Handler cho IllegalArgumentException
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
    }

    /**
     * Xác định loại vị trí ghế (Cửa sổ, Đường đi, Giữa)
     * @param viTriGhe Vị trí ghế từ database (WINDOW, AISLE, MIDDLE)
     * @return Loại vị trí: WINDOW, AISLE, MIDDLE
     */
    private String determineSeatPosition(String viTriGhe) {
        if (viTriGhe == null || viTriGhe.isEmpty()) {
            return "MIDDLE";
        }
        
        // Database đã lưu sẵn: WINDOW, AISLE, MIDDLE
        // Trả về trực tiếp giá trị từ database
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

    /**
     * Lấy danh sách chuyến bay có thể đổi
     * - Từ thờ gian hiện tại trở đi
     * - Không bao gồm chuyến bay đã hủy
     * - Cùng tuyến bay với chuyến hiện tại
     */
    @GetMapping("/{id}/available-flights")
    @RequirePermission(feature = "BOOKING", action = "VIEW")
    @Operation(summary = "Lấy danh sách chuyến bay có thể đổi", description = "Yêu cầu quyền BOOKING_VIEW")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableFlightsForChange(
            @Parameter(description = "Mã đặt chỗ")
            @PathVariable int id) {
        
        DatChoAdminResponse datCho = quanLyDatChoService.getDatChoById(id);
        
        // Lấy thông tin chuyến bay hiện tại để biết sân bay (lấy ID từ database)
        ChiTietChuyenBay currentFlight = chuyenBayRepository.findById(datCho.getMaChuyenBay())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chuyến bay"));
        
        int maSanBayDi = currentFlight.getTuyenBay().getSanBayDi().getMaSanBay();
        int maSanBayDen = currentFlight.getTuyenBay().getSanBayDen().getMaSanBay();
        
        // Lấy danh sách chuyến bay phù hợp
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
     * Lấy sơ đồ ghế của chuyến bay để đổi ghế
     */
    @GetMapping("/{id}/seat-map")
    @RequirePermission(feature = "BOOKING", action = "VIEW")
    @Operation(summary = "Lấy sơ đồ ghế", description = "Yêu cầu quyền BOOKING_VIEW")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSeatMap(
            @Parameter(description = "Mã đặt chỗ")
            @PathVariable int id) {
        
        DatChoAdminResponse datCho = quanLyDatChoService.getDatChoById(id);
        
        // Lấy thông tin chuyến bay để biết máy bay
        ChiTietChuyenBay chuyenBay = chuyenBayRepository.findById(datCho.getMaChuyenBay())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chuyến bay"));
        
        // Lấy tất cả ghế của máy bay
        List<ChiTietGhe> allSeats = chiTietGheRepository.findByMayBay_MaMayBay(
                chuyenBay.getMayBay().getMaMayBay());
        
        // Lấy danh sách ghế đã đặt của chuyến bay này
        List<Integer> bookedSeatIds = gheDaDatRepository.findByChuyenBay_MaChuyenBay(datCho.getMaChuyenBay())
                .stream()
                .filter(gdd -> !"CANCELLED".equals(gdd.getDatCho().getTrangThai()))
                .map(gdd -> gdd.getGhe().getMaGhe())
                .collect(Collectors.toList());
        
        // Tạo sơ đồ ghế
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
            
            // Xác định loại vị trí ghế từ database
            String loaiViTri = determineSeatPosition(ghe.getViTriGhe());
            seat.put("loaiViTri", loaiViTri);
            
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
     * Tính phí đổi hạng vé
     */
    @GetMapping("/{id}/tinh-phi-doi-hang-ve")
    @RequirePermission(feature = "BOOKING", action = "VIEW")
    @Operation(summary = "Tính phí đổi hạng vé", description = "Yêu cầu quyền BOOKING_VIEW")
    public ResponseEntity<ApiResponse<DoiHangVeResponse>> tinhPhiDoiHangVe(
            @Parameter(description = "Mã đặt chỗ")
            @PathVariable int id,
            @Parameter(description = "Mã hạng vé mới")
            @RequestParam int maHangVeMoi) {
        
        DoiHangVeResponse response = quanLyDatChoService.tinhPhiDoiHangVe(id, maHangVeMoi);
        return ResponseEntity.ok(ApiResponse.success("Tính phí đổi hạng vé thành công", response));
    }

    /**
     * Đổi hạng vé cho đặt chỗ
     */
    @PutMapping("/{id}/doi-hang-ve")
    @RequirePermission(feature = "BOOKING", action = "UPDATE")
    @Operation(summary = "Đổi hạng vé", description = "Yêu cầu quyền BOOKING_UPDATE")
    public ResponseEntity<ApiResponse<DoiHangVeResponse>> doiHangVe(
            @Parameter(description = "Mã đặt chỗ")
            @PathVariable int id,
            @Valid @RequestBody DoiHangVeRequest request) {
        
        DoiHangVeResponse response = quanLyDatChoService.doiHangVe(id, request);
        return ResponseEntity.ok(ApiResponse.success("Đổi hạng vé thành công", response));
    }
}
