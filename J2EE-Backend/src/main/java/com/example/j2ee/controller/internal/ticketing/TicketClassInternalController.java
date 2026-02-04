package com.example.j2ee.controller.internal.ticketing;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.hangve.CreateHangVeRequest;
import com.example.j2ee.dto.hangve.UpdateHangVeRequest;
import com.example.j2ee.model.HangVe;
import com.example.j2ee.service.HangVeService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Internal API Controller for Ticket Class Management
 * Base URL: /internal/ticket-classes
 * 
 * Provides internal/admin APIs for ticket class management.
 * JWT Authentication Required.
 */
@RestController
@RequestMapping("/internal/ticket-classes")
public class TicketClassInternalController {

    private final HangVeService hangVeService;

    public TicketClassInternalController(HangVeService hangVeService) {
        this.hangVeService = hangVeService;
    }

    // ==================== READ ENDPOINTS ====================

    /**
     * GET /internal/ticket-classes - Get all ticket classes
     */
    @GetMapping
    @RequirePermission(feature = "TICKET_CLASS", action = "VIEW")
    public ResponseEntity<ApiResponse<List<HangVe>>> getAllTicketClasses() {
        List<HangVe> ticketClasses = hangVeService.findAll();
        return ResponseEntity.ok(ApiResponse.success(ticketClasses));
    }

    /**
     * GET /internal/ticket-classes/{id} - Get ticket class by ID
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "TICKET_CLASS", action = "VIEW")
    public ResponseEntity<ApiResponse<HangVe>> getTicketClassById(@PathVariable Integer id) {
        try {
            HangVe ticketClass = hangVeService.findById(id);
            return ResponseEntity.ok(ApiResponse.success(ticketClass));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * GET /internal/ticket-classes/deleted - Get deleted ticket classes
     */
    @GetMapping("/deleted")
    @RequirePermission(feature = "TICKET_CLASS", action = "VIEW")
    public ResponseEntity<ApiResponse<List<HangVe>>> getDeletedTicketClasses() {
        List<HangVe> deletedTicketClasses = hangVeService.getDeletedHangVe();
        return ResponseEntity.ok(ApiResponse.success(deletedTicketClasses));
    }

    // ==================== CREATE ENDPOINTS ====================

    /**
     * POST /internal/ticket-classes - Create new ticket class
     */
    @PostMapping
    @RequirePermission(feature = "TICKET_CLASS", action = "CREATE")
    public ResponseEntity<ApiResponse<HangVe>> createTicketClass(
            @Valid @RequestBody CreateHangVeRequest request) {
        try {
            HangVe ticketClass = new HangVe();
            ticketClass.setTenHangVe(request.getTenHangVe());
            ticketClass.setDaXoa(false);

            HangVe created = hangVeService.createHangVe(ticketClass);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Tạo hạng vé thành công", created));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== UPDATE ENDPOINTS ====================

    /**
     * PUT /internal/ticket-classes/{id} - Update ticket class
     */
    @PutMapping("/{id}")
    @RequirePermission(feature = "TICKET_CLASS", action = "UPDATE")
    public ResponseEntity<ApiResponse<HangVe>> updateTicketClass(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateHangVeRequest request) {
        try {
            HangVe ticketClass = new HangVe();
            ticketClass.setTenHangVe(request.getTenHangVe());

            HangVe updated = hangVeService.updateHangVe(id, ticketClass);
            return ResponseEntity.ok(
                    ApiResponse.success("Cập nhật hạng vé thành công", updated));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * PUT /internal/ticket-classes/{id}/restore - Restore deleted ticket class
     */
    @PutMapping("/{id}/restore")
    @RequirePermission(feature = "TICKET_CLASS", action = "RESTORE")
    public ResponseEntity<ApiResponse<HangVe>> restoreTicketClass(@PathVariable Integer id) {
        try {
            HangVe restored = hangVeService.restoreHangVe(id);
            return ResponseEntity.ok(
                    ApiResponse.success("Khôi phục hạng vé thành công", restored));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== DELETE ENDPOINTS ====================

    /**
     * DELETE /internal/ticket-classes/{id} - Delete ticket class
     */
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "TICKET_CLASS", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteTicketClass(@PathVariable Integer id) {
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
}
