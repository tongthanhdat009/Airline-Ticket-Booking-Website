package com.example.j2ee.controller.publicapi;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.ChiTietGhe;
import com.example.j2ee.model.MayBay;
import com.example.j2ee.service.ChiTietGheService;
import com.example.j2ee.service.MayBayService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public API Controller for Aircraft
 * Base URL: /api/v1/aircrafts
 * 
 * Provides public read-only access to aircraft data for dropdowns and lookups.
 * No authentication required.
 */
@RestController
@RequestMapping("/api/v1/aircrafts")
public class AircraftController {

    private final MayBayService mayBayService;
    private final ChiTietGheService chiTietGheService;

    public AircraftController(MayBayService mayBayService, ChiTietGheService chiTietGheService) {
        this.mayBayService = mayBayService;
        this.chiTietGheService = chiTietGheService;
    }

    /**
     * GET /api/v1/aircrafts - Get all aircraft
     * 
     * @return List of all aircraft
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MayBay>>> getAllAircrafts() {
        List<MayBay> aircrafts = mayBayService.getAllMayBay();
        return ResponseEntity.ok(ApiResponse.success(aircrafts));
    }

    /**
     * GET /api/v1/aircrafts/active - Get active aircraft only
     * 
     * @return List of active aircraft
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<MayBay>>> getActiveAircrafts() {
        List<MayBay> aircrafts = mayBayService.getActiveMayBay();
        return ResponseEntity.ok(ApiResponse.success(aircrafts));
    }

    /**
     * GET /api/v1/aircrafts/{aircraftId}/seats - Get seats of an aircraft
     * 
     * @param aircraftId Aircraft ID
     * @return List of seats for the aircraft
     */
    @GetMapping("/{aircraftId}/seats")
    public ResponseEntity<ApiResponse<List<ChiTietGhe>>> getAircraftSeats(@PathVariable Integer aircraftId) {
        try {
            List<ChiTietGhe> seats = chiTietGheService.getChiTietGheByMayBay(aircraftId);
            if (seats == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy máy bay với ID: " + aircraftId));
            }
            return ResponseEntity.ok(ApiResponse.success(seats));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
