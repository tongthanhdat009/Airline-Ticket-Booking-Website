package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.hangve.CreateHangVeRequest;
import com.example.j2ee.dto.hangve.UpdateHangVeRequest;
import com.example.j2ee.model.HangVe;
import com.example.j2ee.service.HangVeService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller quản lý hạng vé
 */
@RestController
@RequestMapping("/admin/dashboard/hangve")
public class QuanLyHangVeController {

    private final HangVeService hangVeService;

    public QuanLyHangVeController(HangVeService hangVeService) {
        this.hangVeService = hangVeService;
    }

    /**
     * Lấy danh sách tất cả hạng vé
     */
    @GetMapping
    @PreAuthorize("hasAuthority('TICKET_CLASS_VIEW')")
    public ResponseEntity<ApiResponse<List<HangVe>>> getAllHangVe() {
        List<HangVe> hangVeList = hangVeService.findAll();
        return ResponseEntity.ok(ApiResponse.success(hangVeList));
    }

    /**
     * Lấy thông tin hạng vé theo ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('TICKET_CLASS_VIEW')")
    public ResponseEntity<ApiResponse<HangVe>> getHangVeById(@PathVariable Integer id) {
        try {
            HangVe hangVe = hangVeService.findById(id);
            return ResponseEntity.ok(ApiResponse.success(hangVe));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Tạo hạng vé mới
     */
    @PostMapping
    @PreAuthorize("hasAuthority('TICKET_CLASS_CREATE')")
    public ResponseEntity<ApiResponse<HangVe>> createHangVe(
            @Valid @RequestBody CreateHangVeRequest request) {
        try {
            HangVe hangVe = new HangVe();
            hangVe.setTenHangVe(request.getTenHangVe());
            hangVe.setDaXoa(false);

            HangVe createdHangVe = hangVeService.createHangVe(hangVe);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Tạo hạng vé thành công", createdHangVe));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Cập nhật thông tin hạng vé
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('TICKET_CLASS_UPDATE')")
    public ResponseEntity<ApiResponse<HangVe>> updateHangVe(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateHangVeRequest request) {
        try {
            HangVe hangVe = new HangVe();
            hangVe.setTenHangVe(request.getTenHangVe());

            HangVe updatedHangVe = hangVeService.updateHangVe(id, hangVe);
            return ResponseEntity.ok(
                    ApiResponse.success("Cập nhật hạng vé thành công", updatedHangVe)
            );
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Xóa mềm hạng vé (cascade soft-delete)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('TICKET_CLASS_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteHangVe(@PathVariable Integer id) {
        try {
            hangVeService.deleteHangVe(id);
            return ResponseEntity.ok(ApiResponse.successMessage("Đã xóa thành công hạng vé có mã: " + id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Khôi phục hạng vé đã xóa mềm
     */
    @PutMapping("/{id}/restore")
    @PreAuthorize("hasAuthority('TICKET_CLASS_MANAGE')")
    public ResponseEntity<ApiResponse<HangVe>> restoreHangVe(@PathVariable Integer id) {
        try {
            HangVe restoredHangVe = hangVeService.restoreHangVe(id);
            return ResponseEntity.ok(
                    ApiResponse.success("Khôi phục hạng vé thành công", restoredHangVe)
            );
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Lấy danh sách hạng vé đã xóa mềm
     */
    @GetMapping("/deleted")
    @PreAuthorize("hasAuthority('TICKET_CLASS_VIEW')")
    public ResponseEntity<ApiResponse<List<HangVe>>> getDeletedHangVe() {
        List<HangVe> deletedHangVeList = hangVeService.getDeletedHangVe();
        return ResponseEntity.ok(ApiResponse.success(deletedHangVeList));
    }
}
