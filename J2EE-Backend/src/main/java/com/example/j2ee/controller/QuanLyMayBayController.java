package com.example.j2ee.controller;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.maybay.CreateMayBayRequest;
import com.example.j2ee.dto.maybay.UpdateMayBayRequest;
import com.example.j2ee.model.MayBay;
import com.example.j2ee.service.MayBayService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller quản lý máy bay
 */
@RestController
@RequestMapping("/admin/dashboard/maybay")
public class QuanLyMayBayController {

    private final MayBayService mayBayService;

    public QuanLyMayBayController(MayBayService mayBayService) {
        this.mayBayService = mayBayService;
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
}
