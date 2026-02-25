package com.example.j2ee.controller;

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
 * Controller quản lý máy bay
 */
@RestController
@RequestMapping("/admin/dashboard/maybay")
public class QuanLyMayBayController {

    private final MayBayService mayBayService;
    private final ChiTietGheService chiTietGheService;

    public QuanLyMayBayController(MayBayService mayBayService, ChiTietGheService chiTietGheService) {
        this.mayBayService = mayBayService;
        this.chiTietGheService = chiTietGheService;
    }

    /**
     * Lấy danh sách tất cả máy bay
     */
    @GetMapping
    @RequirePermission(feature = "AIRCRAFT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<MayBay>>> getAllMayBay() {
        List<MayBay> mayBayList = mayBayService.getAllMayBay();
        return ResponseEntity.ok(ApiResponse.success(mayBayList));
    }

    /**
     * Lấy danh sách máy bay đang hoạt động (Active)
     */
    @GetMapping("/active")
    @RequirePermission(feature = "AIRCRAFT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<MayBay>>> getActiveMayBay() {
        List<MayBay> activeMayBayList = mayBayService.getActiveMayBay();
        return ResponseEntity.ok(ApiResponse.success(activeMayBayList));
    }

    /**
     * Lấy thông tin máy bay theo ID
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "AIRCRAFT", action = "VIEW")
    public ResponseEntity<ApiResponse<MayBay>> getMayBayById(@PathVariable Integer id) {
        try {
            MayBay mayBay = mayBayService.getMayBayById(id);
            return ResponseEntity.ok(ApiResponse.success(mayBay));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Tạo máy bay mới
     */
    @PostMapping
    @RequirePermission(feature = "AIRCRAFT", action = "CREATE")
    public ResponseEntity<ApiResponse<MayBay>> createMayBay(
            @Valid @RequestBody CreateMayBayRequest request) {
        try {
            MayBay newMayBay = mayBayService.createMayBay(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Tạo máy bay thành công", newMayBay));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Cập nhật thông tin máy bay
     */
    @PutMapping("/{id}")
    @RequirePermission(feature = "AIRCRAFT", action = "UPDATE")
    public ResponseEntity<ApiResponse<MayBay>> updateMayBay(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateMayBayRequest request) {
        try {
            MayBay updatedMayBay = mayBayService.updateMayBay(id, request);
            return ResponseEntity.ok(
                    ApiResponse.success("Cập nhật máy bay thành công", updatedMayBay));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Xóa mềm máy bay
     */
    @DeleteMapping
    @RequirePermission(feature = "AIRCRAFT", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteMayBay(
            @RequestParam("maMayBay") Integer maMayBay) {
        try {
            mayBayService.deleteMayBay(maMayBay);
            String message = "Đã xóa thành công máy bay có mã: " + maMayBay;
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
     * Cập nhật trạng thái máy bay
     */
    @PutMapping("/trangthai")
    @RequirePermission(feature = "AIRCRAFT", action = "UPDATE")
    public ResponseEntity<ApiResponse<MayBay>> updateTrangThaiMayBay(
            @RequestParam Integer maMayBay,
            @RequestParam String trangThai) {
        try {
            MayBay updatedMayBay = mayBayService.updateTrangThaiMayBay(maMayBay, trangThai);
            return ResponseEntity.ok(
                    ApiResponse.success("Cập nhật trạng thái máy bay thành công", updatedMayBay));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Khôi phục máy bay đã xóa mềm
     */
    @PutMapping("/{id}/restore")
    @RequirePermission(feature = "AIRCRAFT", action = "RESTORE")
    public ResponseEntity<ApiResponse<MayBay>> restoreMayBay(@PathVariable Integer id) {
        try {
            MayBay restoredMayBay = mayBayService.restoreMayBay(id);
            return ResponseEntity.ok(
                    ApiResponse.success("Khôi phục máy bay thành công", restoredMayBay));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Lấy danh sách máy bay đã xóa mềm
     */
    @GetMapping("/deleted")
    @RequirePermission(feature = "AIRCRAFT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<MayBay>>> getDeletedMayBay() {
        List<MayBay> deletedMayBayList = mayBayService.getDeletedMayBay();
        return ResponseEntity.ok(ApiResponse.success(deletedMayBayList));
    }

    /**
     * Lấy danh sách ghế của máy bay
     */
    @GetMapping("/{id}/ghe")
    @RequirePermission(feature = "AIRCRAFT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ChiTietGhe>>> getSeatsByAircraft(@PathVariable Integer id) {
        try {
            List<ChiTietGhe> seats = chiTietGheService.getChiTietGheByMayBay(id);
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
    @PostMapping("/{id}/ghe")
    @RequirePermission(feature = "AIRCRAFT", action = "UPDATE")
    public ResponseEntity<ApiResponse<ChiTietGhe>> addSeat(
            @PathVariable Integer id,
            @RequestBody SeatLayoutRequest request) {
        try {
            ChiTietGhe newSeat = chiTietGheService.addSeatToAircraft(id, request);
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
    @PutMapping("/update-seat/{maGhe}")
    @RequirePermission(feature = "AIRCRAFT", action = "UPDATE")
    public ResponseEntity<ApiResponse<ChiTietGhe>> updateSeat(
            @PathVariable Integer maGhe,
            @RequestBody SeatLayoutRequest request) {
        try {
            ChiTietGhe updatedSeat = chiTietGheService.updateSeat(maGhe, request);
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
     * Xóa một ghế
     */
    @DeleteMapping("/delete-seat/{maGhe}")
    @RequirePermission(feature = "AIRCRAFT", action = "UPDATE")
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
    @DeleteMapping("/{id}/ghe")
    @RequirePermission(feature = "AIRCRAFT", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteAllSeats(@PathVariable Integer id) {
        try {
            chiTietGheService.deleteAllSeatsByAircraft(id);
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
    @PostMapping("/{id}/ghe/auto-generate")
    @RequirePermission(feature = "AIRCRAFT", action = "UPDATE")
    public ResponseEntity<ApiResponse<List<ChiTietGhe>>> autoGenerateSeats(
            @PathVariable Integer id,
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

            List<ChiTietGhe> createdSeats = chiTietGheService.autoGenerateSeatLayout(id, configs);
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

    /**
     * DTO để nhận request auto-generate
     */
    public static class SeatConfigRequest {
        private Integer maHangVe;
        private int startRow;
        private int endRow;
        private List<String> columns;
        private String viTriGhe;

        public Integer getMaHangVe() {
            return maHangVe;
        }

        public void setMaHangVe(Integer maHangVe) {
            this.maHangVe = maHangVe;
        }

        public int getStartRow() {
            return startRow;
        }

        public void setStartRow(int startRow) {
            this.startRow = startRow;
        }

        public int getEndRow() {
            return endRow;
        }

        public void setEndRow(int endRow) {
            this.endRow = endRow;
        }

        public List<String> getColumns() {
            return columns;
        }

        public void setColumns(List<String> columns) {
            this.columns = columns;
        }

        public String getViTriGhe() {
            return viTriGhe;
        }

        public void setViTriGhe(String viTriGhe) {
            this.viTriGhe = viTriGhe;
        }
    }
}
