package com.example.j2ee.controller.internal.operations;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.maybay.CreateMayBayRequest;
import com.example.j2ee.dto.maybay.SeatLayoutRequest;
import com.example.j2ee.dto.maybay.UpdateMayBayRequest;
import com.example.j2ee.model.ChiTietGhe;
import com.example.j2ee.model.MayBay;
import com.example.j2ee.service.ChiTietGheService;
import com.example.j2ee.service.MayBayService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Internal API Controller for Aircraft Management
 * Base URL: /internal/aircrafts
 * 
 * Provides internal/admin APIs for aircraft management.
 * JWT Authentication Required.
 */
@RestController
@RequestMapping("/internal/aircrafts")
public class AircraftInternalController {

    private final MayBayService mayBayService;
    private final ChiTietGheService chiTietGheService;

    public AircraftInternalController(MayBayService mayBayService, ChiTietGheService chiTietGheService) {
        this.mayBayService = mayBayService;
        this.chiTietGheService = chiTietGheService;
    }

    // ==================== READ ENDPOINTS ====================

    /**
     * GET /internal/aircrafts - Get all aircraft
     */
    @GetMapping
    @RequirePermission(feature = "AIRCRAFT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<MayBay>>> getAllAircrafts() {
        List<MayBay> aircrafts = mayBayService.getAllMayBay();
        return ResponseEntity.ok(ApiResponse.success(aircrafts));
    }

    /**
     * GET /internal/aircrafts/active - Get active aircraft only
     */
    @GetMapping("/active")
    @RequirePermission(feature = "AIRCRAFT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<MayBay>>> getActiveAircrafts() {
        List<MayBay> activeAircrafts = mayBayService.getActiveMayBay();
        return ResponseEntity.ok(ApiResponse.success(activeAircrafts));
    }

    /**
     * GET /internal/aircrafts/{id} - Get aircraft by ID
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "AIRCRAFT", action = "VIEW")
    public ResponseEntity<ApiResponse<MayBay>> getAircraftById(@PathVariable Integer id) {
        try {
            MayBay aircraft = mayBayService.getMayBayById(id);
            return ResponseEntity.ok(ApiResponse.success(aircraft));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * GET /internal/aircrafts/deleted - Get deleted aircraft
     */
    @GetMapping("/deleted")
    @RequirePermission(feature = "AIRCRAFT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<MayBay>>> getDeletedAircrafts() {
        List<MayBay> deletedAircrafts = mayBayService.getDeletedMayBay();
        return ResponseEntity.ok(ApiResponse.success(deletedAircrafts));
    }

    /**
     * GET /internal/aircrafts/{aircraftId}/seats - Get seats by aircraft
     */
    @GetMapping("/{aircraftId}/seats")
    @RequirePermission(feature = "AIRCRAFT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ChiTietGhe>>> getSeatsByAircraft(@PathVariable Integer aircraftId) {
        try {
            List<ChiTietGhe> seats = chiTietGheService.getChiTietGheByMayBay(aircraftId);
            if (seats == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy máy bay"));
            }
            return ResponseEntity.ok(ApiResponse.success(seats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== CREATE ENDPOINTS ====================

    /**
     * POST /internal/aircrafts - Create new aircraft
     */
    @PostMapping
    @RequirePermission(feature = "AIRCRAFT", action = "CREATE")
    public ResponseEntity<ApiResponse<MayBay>> createAircraft(
            @Valid @RequestBody CreateMayBayRequest request) {
        try {
            MayBay newAircraft = mayBayService.createMayBay(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Tạo máy bay thành công", newAircraft));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /internal/aircrafts/{aircraftId}/seats - Add seat to aircraft
     */
    @PostMapping("/{aircraftId}/seats")
    @RequirePermission(feature = "AIRCRAFT", action = "UPDATE")
    public ResponseEntity<ApiResponse<ChiTietGhe>> addSeat(
            @PathVariable Integer aircraftId,
            @RequestBody SeatLayoutRequest request) {
        try {
            ChiTietGhe newSeat = chiTietGheService.addSeatToAircraft(aircraftId, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Thêm ghế thành công", newSeat));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /internal/aircrafts/{aircraftId}/seats/generate - Auto generate seat layout
     */
    @PostMapping("/{aircraftId}/seats/generate")
    @RequirePermission(feature = "AIRCRAFT", action = "UPDATE")
    public ResponseEntity<ApiResponse<List<ChiTietGhe>>> autoGenerateSeats(
            @PathVariable Integer aircraftId,
            @RequestBody Map<String, List<SeatConfigRequest>> request) {
        try {
            List<SeatConfigRequest> configRequests = request.get("configs");
            List<ChiTietGheService.SeatConfig> configs = configRequests.stream()
                    .map(req -> new ChiTietGheService.SeatConfig(
                            req.getMaHangVe(),
                            req.getStartRow(),
                            req.getEndRow(),
                            req.getColumns(),
                            req.getViTriGhe()))
                    .toList();

            List<ChiTietGhe> createdSeats = chiTietGheService.autoGenerateSeatLayout(aircraftId, configs);
            return ResponseEntity.ok(
                    ApiResponse.success("Tự động tạo sơ đồ ghế thành công", createdSeats));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== UPDATE ENDPOINTS ====================

    /**
     * PUT /internal/aircrafts/{id} - Update aircraft
     */
    @PutMapping("/{id}")
    @RequirePermission(feature = "AIRCRAFT", action = "UPDATE")
    public ResponseEntity<ApiResponse<MayBay>> updateAircraft(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateMayBayRequest request) {
        try {
            MayBay updatedAircraft = mayBayService.updateMayBay(id, request);
            return ResponseEntity.ok(
                    ApiResponse.success("Cập nhật máy bay thành công", updatedAircraft));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * PATCH /internal/aircrafts/{id}/status - Update aircraft status
     */
    @PatchMapping("/{id}/status")
    @RequirePermission(feature = "AIRCRAFT", action = "UPDATE")
    public ResponseEntity<ApiResponse<MayBay>> updateAircraftStatus(
            @PathVariable Integer id,
            @RequestParam String trangThai) {
        try {
            MayBay updatedAircraft = mayBayService.updateTrangThaiMayBay(id, trangThai);
            return ResponseEntity.ok(
                    ApiResponse.success("Cập nhật trạng thái máy bay thành công", updatedAircraft));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * PUT /internal/aircrafts/{id}/restore - Restore deleted aircraft
     */
    @PutMapping("/{id}/restore")
    @RequirePermission(feature = "AIRCRAFT", action = "RESTORE")
    public ResponseEntity<ApiResponse<MayBay>> restoreAircraft(@PathVariable Integer id) {
        try {
            MayBay restoredAircraft = mayBayService.restoreMayBay(id);
            return ResponseEntity.ok(
                    ApiResponse.success("Khôi phục máy bay thành công", restoredAircraft));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== DELETE ENDPOINTS ====================

    /**
     * DELETE /internal/aircrafts/{id} - Delete aircraft
     */
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "AIRCRAFT", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteAircraft(@PathVariable Integer id) {
        try {
            mayBayService.deleteMayBay(id);
            String message = "Đã xóa thành công máy bay có mã: " + id;
            return ResponseEntity.ok(ApiResponse.successMessage(message));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * DELETE /internal/aircrafts/{aircraftId}/seats - Delete all seats
     */
    @DeleteMapping("/{aircraftId}/seats")
    @RequirePermission(feature = "AIRCRAFT", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteAllSeats(@PathVariable Integer aircraftId) {
        try {
            chiTietGheService.deleteAllSeatsByAircraft(aircraftId);
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa tất cả ghế thành công"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== SEAT INTERNAL ENDPOINTS ====================

    /**
     * PUT /internal/seats/{seatId} - Update seat
     */
    @PutMapping("/seats/{seatId}")
    @RequirePermission(feature = "AIRCRAFT", action = "UPDATE")
    public ResponseEntity<ApiResponse<ChiTietGhe>> updateSeat(
            @PathVariable Integer seatId,
            @RequestBody SeatLayoutRequest request) {
        try {
            ChiTietGhe updatedSeat = chiTietGheService.updateSeat(seatId, request);
            return ResponseEntity.ok(
                    ApiResponse.success("Cập nhật ghế thành công", updatedSeat));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * DELETE /internal/seats/{seatId} - Delete seat
     */
    @DeleteMapping("/seats/{seatId}")
    @RequirePermission(feature = "AIRCRAFT", action = "UPDATE")
    public ResponseEntity<ApiResponse<Void>> deleteSeat(@PathVariable Integer seatId) {
        try {
            chiTietGheService.deleteSeat(seatId);
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa ghế thành công"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * DTO for seat config request
     */
    public static class SeatConfigRequest {
        private Integer maHangVe;
        private int startRow;
        private int endRow;
        private List<String> columns;
        private String viTriGhe;

        public Integer getMaHangVe() { return maHangVe; }
        public void setMaHangVe(Integer maHangVe) { this.maHangVe = maHangVe; }
        public int getStartRow() { return startRow; }
        public void setStartRow(int startRow) { this.startRow = startRow; }
        public int getEndRow() { return endRow; }
        public void setEndRow(int endRow) { this.endRow = endRow; }
        public List<String> getColumns() { return columns; }
        public void setColumns(List<String> columns) { this.columns = columns; }
        public String getViTriGhe() { return viTriGhe; }
        public void setViTriGhe(String viTriGhe) { this.viTriGhe = viTriGhe; }
    }
}
