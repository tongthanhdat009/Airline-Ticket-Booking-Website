package com.example.j2ee.controller.internal.operations;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.ChiTietChuyenBay;
import com.example.j2ee.model.DichVuCungCap;
import com.example.j2ee.service.ChiTietChuyenBayService;
import com.example.j2ee.service.GheService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;
import java.util.Set;

/**
 * Internal API Controller for Flight Management
 * Base URL: /internal/flights
 * 
 * Provides internal/admin APIs for flight management.
 * JWT Authentication Required.
 */
@RestController
@RequestMapping("/internal/flights")
public class FlightInternalController {

    private final ChiTietChuyenBayService chiTietChuyenBayService;
    private final GheService gheService;

    public FlightInternalController(ChiTietChuyenBayService chiTietChuyenBayService,
                                   GheService gheService) {
        this.chiTietChuyenBayService = chiTietChuyenBayService;
        this.gheService = gheService;
    }

    // ==================== READ ENDPOINTS ====================

    /**
     * GET /internal/flights - Get all flights
     */
    @GetMapping
    @RequirePermission(feature = "FLIGHT", action = "VIEW")
    public ResponseEntity<ApiResponse<Iterable<ChiTietChuyenBay>>> getAllFlights() {
        Iterable<ChiTietChuyenBay> flights = chiTietChuyenBayService.getAllChiTietChuyenBay();
        return ResponseEntity.ok(ApiResponse.success(flights));
    }

    /**
     * GET /internal/flights/{id} - Get flight by ID
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "FLIGHT", action = "VIEW")
    public ResponseEntity<ApiResponse<ChiTietChuyenBay>> getFlightById(@PathVariable int id) {
        return chiTietChuyenBayService.getChiTietChuyenBayById(id)
                .map(flight -> ResponseEntity.ok(ApiResponse.success(flight)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy chuyến bay")));
    }

    /**
     * GET /internal/flights/deleted - Get all deleted flights
     */
    @GetMapping("/deleted")
    @RequirePermission(feature = "FLIGHT", action = "VIEW")
    public ResponseEntity<ApiResponse<Iterable<ChiTietChuyenBay>>> getAllDeletedFlights() {
        try {
            Iterable<ChiTietChuyenBay> deletedFlights = chiTietChuyenBayService.getAllDeletedChiTietChuyenBay();
            return ResponseEntity.ok(ApiResponse.success(deletedFlights));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách chuyến bay đã xóa: " + e.getMessage()));
        }
    }

    // ==================== CREATE ENDPOINTS ====================

    /**
     * POST /internal/flights - Create new flight
     */
    @PostMapping
    @RequirePermission(feature = "FLIGHT", action = "CREATE")
    public ResponseEntity<ApiResponse<ChiTietChuyenBay>> createFlight(@RequestBody ChiTietChuyenBay body) {
        String msg = chiTietChuyenBayService.createChiTietChuyenBay(body);
        if ("Thêm chi tiết chuyến bay thành công".equals(msg)) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(body));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(msg));
    }

    /**
     * POST /internal/flights/{flightId}/seats - Add seats to flight
     */
    @PostMapping("/{flightId}/seats")
    @RequirePermission(feature = "FLIGHT", action = "CREATE")
    public ResponseEntity<ApiResponse<Void>> addSeatsToFlight(
            @PathVariable int flightId,
            @RequestBody Map<String, Integer> soGheTheoHangVe) {
        try {
            var flightOpt = chiTietChuyenBayService.getChiTietChuyenBayById(flightId);
            if (flightOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Chuyến bay không tồn tại: " + flightId));
            }

            ChiTietChuyenBay flight = flightOpt.get();
            if (flight.getMayBay() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Chuyến bay chưa có máy bay được gán"));
            }

            int aircraftId = flight.getMayBay().getMaMayBay();
            String msg = gheService.addGheToMayBay(aircraftId, soGheTheoHangVe);
            if (msg.contains("thành công")) {
                return ResponseEntity.ok(ApiResponse.successMessage(msg));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Lỗi khi thêm ghế: " + e.getMessage()));
        }
    }

    // ==================== UPDATE ENDPOINTS ====================

    /**
     * PUT /internal/flights/{id} - Update flight
     */
    @PutMapping("/{id}")
    @RequirePermission(feature = "FLIGHT", action = "UPDATE")
    public ResponseEntity<ApiResponse<Void>> updateFlight(
            @PathVariable int id,
            @RequestBody ChiTietChuyenBay body) {
        body.setMaChuyenBay(id);
        String msg = chiTietChuyenBayService.updateChiTietChuyenBay(body);
        if ("Sửa chi tiết chuyến bay thành công".equals(msg)) {
            return ResponseEntity.ok(ApiResponse.successMessage(msg));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(msg));
    }

    /**
     * PATCH /internal/flights/{id}/status - Update flight status
     */
    @PatchMapping("/{id}/status")
    @RequirePermission(feature = "FLIGHT", action = "UPDATE")
    public ResponseEntity<ApiResponse<Void>> updateFlightStatus(
            @PathVariable int id,
            @RequestParam("trangThai") String trangThai) {
        String msg = chiTietChuyenBayService.updateTrangThaiChuyenBay(id, trangThai);
        if ("Cập nhật trạng thái chuyến bay thành công".equals(msg)) {
            return ResponseEntity.ok(ApiResponse.successMessage(msg));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(msg));
    }

    /**
     * PUT /internal/flights/{id}/delay - Update delay information
     */
    @PutMapping("/{id}/delay")
    @RequirePermission(feature = "FLIGHT", action = "UPDATE")
    public ResponseEntity<ApiResponse<Void>> updateDelay(
            @PathVariable int id,
            @RequestBody Map<String, Object> delayData) {
        try {
            String lyDoDelay = (String) delayData.get("lyDoDelay");
            LocalDateTime thoiGianDiThucTe = delayData.get("thoiGianDiThucTe") != null
                    ? LocalDateTime.ofInstant(Instant.ofEpochMilli((Long) delayData.get("thoiGianDiThucTe")),
                            ZoneId.systemDefault())
                    : null;
            LocalDateTime thoiGianDenThucTe = delayData.get("thoiGianDenThucTe") != null
                    ? LocalDateTime.ofInstant(Instant.ofEpochMilli((Long) delayData.get("thoiGianDenThucTe")),
                            ZoneId.systemDefault())
                    : null;

            String msg = chiTietChuyenBayService.updateDelay(id, lyDoDelay, thoiGianDiThucTe, thoiGianDenThucTe);
            if ("Cập nhật delay thành công".equals(msg)) {
                return ResponseEntity.ok(ApiResponse.successMessage(msg));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Dữ liệu không hợp lệ: " + e.getMessage()));
        }
    }

    /**
     * PUT /internal/flights/{id}/cancel - Cancel flight
     */
    @PutMapping("/{id}/cancel")
    @RequirePermission(feature = "FLIGHT", action = "CANCEL")
    public ResponseEntity<ApiResponse<Void>> cancelFlight(
            @PathVariable int id,
            @RequestBody Map<String, Object> cancelData) {
        try {
            String lyDoHuy = (String) cancelData.get("lyDoHuy");
            String msg = chiTietChuyenBayService.updateCancel(id, lyDoHuy);
            if ("Cập nhật hủy chuyến thành công".equals(msg)) {
                return ResponseEntity.ok(ApiResponse.successMessage(msg));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Dữ liệu không hợp lệ: " + e.getMessage()));
        }
    }

    /**
     * PUT /internal/flights/{id}/restore - Restore deleted flight
     */
    @PutMapping("/{id}/restore")
    @RequirePermission(feature = "FLIGHT", action = "RESTORE")
    public ResponseEntity<ApiResponse<ChiTietChuyenBay>> restoreFlight(@PathVariable int id) {
        try {
            String msg = chiTietChuyenBayService.restoreChiTietChuyenBay(id);
            if ("Khôi phục chuyến bay thành công".equals(msg)) {
                var flightOpt = chiTietChuyenBayService.getChiTietChuyenBayById(id);
                if (flightOpt.isPresent()) {
                    return ResponseEntity.ok(ApiResponse.success(msg, flightOpt.get()));
                }
                return ResponseEntity.ok(ApiResponse.successMessage(msg));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi khôi phục chuyến bay: " + e.getMessage()));
        }
    }

    // ==================== DELETE ENDPOINTS ====================

    /**
     * DELETE /internal/flights/{id} - Delete flight
     */
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "FLIGHT", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteFlight(@PathVariable int id) {
        ChiTietChuyenBay flight = new ChiTietChuyenBay();
        flight.setMaChuyenBay(id);
        String msg = chiTietChuyenBayService.deleteChiTietChuyenBay(flight);
        if ("Xóa chi tiết chuyến bay thành công".equals(msg)) {
            return ResponseEntity.ok(ApiResponse.successMessage(msg));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(msg));
    }

    // ==================== SERVICE ENDPOINTS ====================

    /**
     * GET /internal/flights/{flightId}/services - Get flight services
     */
    @GetMapping("/{flightId}/services")
    @RequirePermission(feature = "FLIGHT", action = "VIEW")
    public ResponseEntity<ApiResponse<Set<DichVuCungCap>>> getFlightServices(@PathVariable int flightId) {
        try {
            Set<DichVuCungCap> services = chiTietChuyenBayService.getDichVuByChuyenBay(flightId);
            return ResponseEntity.ok(ApiResponse.success(services));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách dịch vụ: " + e.getMessage()));
        }
    }

    /**
     * POST /internal/flights/{flightId}/services/{serviceId} - Add service to flight
     */
    @PostMapping("/{flightId}/services/{serviceId}")
    @RequirePermission(feature = "FLIGHT", action = "UPDATE")
    public ResponseEntity<ApiResponse<Void>> addServiceToFlight(
            @PathVariable int flightId,
            @PathVariable int serviceId) {
        try {
            String msg = chiTietChuyenBayService.addDichVuToChuyenBay(flightId, serviceId);
            return ResponseEntity.ok(ApiResponse.successMessage(msg));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi thêm dịch vụ: " + e.getMessage()));
        }
    }

    /**
     * DELETE /internal/flights/{flightId}/services/{serviceId} - Remove service from flight
     */
    @DeleteMapping("/{flightId}/services/{serviceId}")
    @RequirePermission(feature = "FLIGHT", action = "UPDATE")
    public ResponseEntity<ApiResponse<Void>> removeServiceFromFlight(
            @PathVariable int flightId,
            @PathVariable int serviceId) {
        try {
            String msg = chiTietChuyenBayService.removeDichVuFromChuyenBay(flightId, serviceId);
            return ResponseEntity.ok(ApiResponse.successMessage(msg));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi xóa dịch vụ: " + e.getMessage()));
        }
    }
}
