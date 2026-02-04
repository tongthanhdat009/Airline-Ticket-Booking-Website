package com.example.j2ee.controller.publicapi;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.ChiTietChuyenBay;
import com.example.j2ee.model.DichVuCungCap;
import com.example.j2ee.service.ChiTietChuyenBayService;
import com.example.j2ee.service.DichVuCungCapService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public API Controller for Flights
 * Base URL: /api/v1/flights
 * 
 * Provides public read-only access to flight data.
 * No authentication required.
 */
@RestController
@RequestMapping("/api/v1/flights")
public class FlightController {

    private final ChiTietChuyenBayService chiTietChuyenBayService;
    private final DichVuCungCapService dichVuCungCapService;

    public FlightController(ChiTietChuyenBayService chiTietChuyenBayService,
                           DichVuCungCapService dichVuCungCapService) {
        this.chiTietChuyenBayService = chiTietChuyenBayService;
        this.dichVuCungCapService = dichVuCungCapService;
    }

    /**
     * GET /api/v1/flights - Get all flights
     * 
     * @return List of all flights
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Iterable<ChiTietChuyenBay>>> getAllFlights() {
        Iterable<ChiTietChuyenBay> flights = chiTietChuyenBayService.getAllChiTietChuyenBay();
        return ResponseEntity.ok(ApiResponse.success(flights));
    }

    /**
     * GET /api/v1/flights/{id} - Get flight by ID
     * 
     * @param id Flight ID
     * @return Flight details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ChiTietChuyenBay>> getFlightById(@PathVariable int id) {
        return chiTietChuyenBayService.getChiTietChuyenBayById(id)
                .map(flight -> ResponseEntity.ok(ApiResponse.success(flight)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy chuyến bay")));
    }

    /**
     * GET /api/v1/flights/{flightId}/services - Get services for a flight
     * 
     * @param flightId Flight ID
     * @return List of services for the flight
     */
    @GetMapping("/{flightId}/services")
    public ResponseEntity<ApiResponse<List<DichVuCungCap>>> getFlightServices(@PathVariable Integer flightId) {
        List<DichVuCungCap> services = dichVuCungCapService.getDichVuTheoChuyenBay(flightId);
        return ResponseEntity.ok(ApiResponse.success(services));
    }
}
