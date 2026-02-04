package com.example.j2ee.controller.publicapi;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.HangVe;
import com.example.j2ee.service.HangVeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public API Controller for Ticket Classes
 * Base URL: /api/v1/ticket-classes
 * 
 * Provides public read-only access to ticket class data for dropdowns and lookups.
 * No authentication required.
 */
@RestController
@RequestMapping("/api/v1/ticket-classes")
public class TicketClassController {

    private final HangVeService hangVeService;

    public TicketClassController(HangVeService hangVeService) {
        this.hangVeService = hangVeService;
    }

    /**
     * GET /api/v1/ticket-classes - Get all ticket classes
     * 
     * @return List of all ticket classes
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<HangVe>>> getAllTicketClasses() {
        List<HangVe> ticketClasses = hangVeService.findAll();
        return ResponseEntity.ok(ApiResponse.success(ticketClasses));
    }
}
