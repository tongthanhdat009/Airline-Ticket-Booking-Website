package com.example.j2ee.controller.internal.operations;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.SanBay;
import com.example.j2ee.service.SanBayService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * Internal API Controller for Airport Management
 * Base URL: /internal/airports
 * 
 * Provides internal/admin APIs for airport management.
 * JWT Authentication Required.
 */
@RestController
@RequestMapping("/internal/airports")
public class AirportInternalController {

    private final SanBayService sanBayService;

    @Value("${airportdb.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public AirportInternalController(SanBayService sanBayService) {
        this.sanBayService = sanBayService;
    }

    // ==================== READ ENDPOINTS ====================

    /**
     * GET /internal/airports - Get all airports
     */
    @GetMapping
    @RequirePermission(feature = "AIRPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<List<SanBay>>> getAllAirports() {
        List<SanBay> airports = sanBayService.getAllSanBay();
        return ResponseEntity.ok(ApiResponse.success(airports));
    }

    /**
     * GET /internal/airports/{icaoCode} - Get airport info from external API
     */
    @GetMapping("/{icaoCode}")
    @RequirePermission(feature = "AIRPORT", action = "VIEW")
    public ResponseEntity<ApiResponse<Object>> getAirportByIcaoCode(@PathVariable String icaoCode) {
        String baseUrl = "https://airportdb.io/api/v1/airport/" + icaoCode + "?apiToken=" + apiKey;

        try {
            ResponseEntity<Object> response = restTemplate.getForEntity(baseUrl, Object.class);
            return ResponseEntity.ok(ApiResponse.success(response.getBody()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching airport data: " + e.getMessage()));
        }
    }

    // ==================== CREATE ENDPOINTS ====================

    /**
     * POST /internal/airports - Create new airport
     */
    @PostMapping
    @RequirePermission(feature = "AIRPORT", action = "CREATE")
    public ResponseEntity<ApiResponse<SanBay>> createAirport(@RequestBody SanBay airport) {
        SanBay newAirport = sanBayService.createSanBay(airport);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo sân bay thành công", newAirport));
    }

    // ==================== UPDATE ENDPOINTS ====================

    /**
     * PATCH /internal/airports/{id}/status - Update airport status
     */
    @PatchMapping("/{id}/status")
    @RequirePermission(feature = "AIRPORT", action = "UPDATE")
    public ResponseEntity<ApiResponse<SanBay>> updateAirportStatus(
            @PathVariable int id,
            @RequestParam("trangThai") String trangThai) {
        try {
            SanBay updatedAirport = sanBayService.updateTrangThaiSanBay(id, trangThai);
            return ResponseEntity.ok(
                    ApiResponse.success("Cập nhật trạng thái sân bay thành công", updatedAirport));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== DELETE ENDPOINTS ====================

    /**
     * DELETE /internal/airports/{id} - Delete airport
     */
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "AIRPORT", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteAirport(@PathVariable int id) {
        try {
            sanBayService.deleteSanBay(id);
            String message = "Đã xóa thành công sân bay có mã: " + id;
            return ResponseEntity.ok(ApiResponse.successMessage(message));

        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));

        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
