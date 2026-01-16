package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.maybay.SeatLayoutRequest;
import com.example.j2ee.model.ChiTietGhe;
import com.example.j2ee.service.ChiTietGheService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller quản lý sơ đồ ghế máy bay
 */
@RestController
@RequestMapping("/admin/dashboard/maybay")
public class QuanLySoDoGheController {

    private final ChiTietGheService chiTietGheService;

    public QuanLySoDoGheController(ChiTietGheService chiTietGheService) {
        this.chiTietGheService = chiTietGheService;
    }

    /**
     * Lấy danh sách ghế của máy bay
     */
    @GetMapping("/{maMayBay}/ghe")
    @PreAuthorize("hasAuthority('AIRCRAFT_VIEW')")
    public ResponseEntity<ApiResponse<List<ChiTietGhe>>> getSeatsByAircraft(@PathVariable Integer maMayBay) {
        try {
            List<ChiTietGhe> seats = chiTietGheService.getChiTietGheByMayBay(maMayBay);
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

    /**
     * Thêm một ghế vào máy bay
     */
    @PostMapping("/{maMayBay}/ghe")
    @PreAuthorize("hasAuthority('AIRCRAFT_UPDATE')")
    public ResponseEntity<ApiResponse<ChiTietGhe>> addSeat(
            @PathVariable Integer maMayBay,
            @RequestBody SeatLayoutRequest request) {
        try {
            ChiTietGhe newSeat = chiTietGheService.addSeatToAircraft(maMayBay, request);
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
     * Cập nhật thông tin ghế
     */
    @PutMapping("/ghe/{maGhe}")
    @PreAuthorize("hasAuthority('AIRCRAFT_UPDATE')")
    public ResponseEntity<ApiResponse<ChiTietGhe>> updateSeat(
            @PathVariable Integer maGhe,
            @RequestBody SeatLayoutRequest request) {
        try {
            ChiTietGhe updatedSeat = chiTietGheService.updateSeat(maGhe, request);
            return ResponseEntity.ok(
                    ApiResponse.success("Cập nhật ghế thành công", updatedSeat)
            );
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Xóa một ghế
     */
    @DeleteMapping("/ghe/{maGhe}")
    @PreAuthorize("hasAuthority('AIRCRAFT_UPDATE')")
    public ResponseEntity<ApiResponse<Void>> deleteSeat(@PathVariable Integer maGhe) {
        try {
            chiTietGheService.deleteSeat(maGhe);
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
     * Xóa tất cả ghế của máy bay
     */
    @DeleteMapping("/{maMayBay}/ghe")
    @PreAuthorize("hasAuthority('AIRCRAFT_MANAGE')")
    public ResponseEntity<ApiResponse<Void>> deleteAllSeats(@PathVariable Integer maMayBay) {
        try {
            chiTietGheService.deleteAllSeatsByAircraft(maMayBay);
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa tất cả ghế thành công"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Tự động tạo sơ đồ ghế cho máy bay
     * Body format:
     * {
     *   "configs": [
     *     {
     *       "maHangVe": 1,
     *       "startRow": 1,
     *       "endRow": 5,
     *       "columns": ["A", "B", "C", "D", "E", "F"],
     *       "viTriGhe": "CỬA SỔ"
     *     }
     *   ]
     * }
     */
    @PostMapping("/{maMayBay}/ghe/auto-generate")
    @PreAuthorize("hasAuthority('AIRCRAFT_MANAGE')")
    public ResponseEntity<ApiResponse<List<ChiTietGhe>>> autoGenerateSeats(
            @PathVariable Integer maMayBay,
            @RequestBody Map<String, List<SeatConfigRequest>> request) {
        try {
            List<SeatConfigRequest> configRequests = request.get("configs");
            List<ChiTietGheService.SeatConfig> configs = configRequests.stream()
                    .map(req -> new ChiTietGheService.SeatConfig(
                            req.getMaHangVe(),
                            req.getStartRow(),
                            req.getEndRow(),
                            req.getColumns(),
                            req.getViTriGhe()
                    ))
                    .toList();

            List<ChiTietGhe> createdSeats = chiTietGheService.autoGenerateSeatLayout(maMayBay, configs);
            return ResponseEntity.ok(
                    ApiResponse.success("Tự động tạo sơ đồ ghế thành công", createdSeats)
            );
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * DTO để nhận request auto-generate
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
