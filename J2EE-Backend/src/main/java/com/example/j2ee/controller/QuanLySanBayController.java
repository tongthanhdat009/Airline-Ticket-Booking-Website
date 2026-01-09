package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.SanBay;
import com.example.j2ee.service.SanBayService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@RequestMapping("/admin/dashboard/sanbay")
public class QuanLySanBayController {
    private final SanBayService sanBayService;

    public QuanLySanBayController(SanBayService sanBayService) {
        this.sanBayService = sanBayService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SanBay>>> getAllSanBay() {
        List<SanBay> sanBayList = sanBayService.getAllSanBay();
        return ResponseEntity.ok(ApiResponse.success(sanBayList));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SanBay>> createSanBay(@RequestBody SanBay sanBay) {
        SanBay newSanBay = sanBayService.createSanBay(sanBay);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo sân bay thành công", newSanBay));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteSanBay(@RequestParam("maSanBay") int maSanBay) {
        try {
            sanBayService.deleteSanBay(maSanBay);
            String message = "Đã xóa thành công sân bay có mã: " + maSanBay;
            return ResponseEntity.ok(ApiResponse.successMessage(message));

        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));

        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/trangthai")
    public ResponseEntity<ApiResponse<SanBay>> updateTrangThaiSanBay(
            @RequestParam("maSanBay") int maSanBay,
            @RequestParam("trangThai") String trangThai) {
        try {
            SanBay updatedSanBay = sanBayService.updateTrangThaiSanBay(maSanBay, trangThai);
            return ResponseEntity.ok(
                ApiResponse.success("Cập nhật trạng thái sân bay thành công", updatedSanBay)
            );
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @Value("${airportdb.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();


    @GetMapping("/{icaoCode}")
    public ResponseEntity<ApiResponse<Object>> getAirportByIcaoCode(@PathVariable String icaoCode) {
        String baseUrl = "https://airportdb.io/api/v1/airport/"+icaoCode+"?apiToken="+apiKey;

        try {
            ResponseEntity<Object> response = restTemplate.getForEntity(baseUrl, Object.class);
            return ResponseEntity.ok(ApiResponse.success(response.getBody()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching airport data: " + e.getMessage()));
        }
    }

    @GetMapping("/trangthai/active")
    public ResponseEntity<ApiResponse<List<SanBay>>> getActiveSanBay() {
        List<SanBay> sanBayList = sanBayService.getActiveSanBay();
        return ResponseEntity.ok(ApiResponse.success(sanBayList));
    }
}