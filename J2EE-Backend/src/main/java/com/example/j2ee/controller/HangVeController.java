package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.HangVe;
import com.example.j2ee.service.HangVeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hangve")
public class HangVeController {

    private final HangVeService hangVeService;

    public HangVeController(HangVeService hangVeService) {
        this.hangVeService = hangVeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HangVe>>> getAllHangVe() {
        List<HangVe> hangVeList = hangVeService.findAll();
        return ResponseEntity.ok(ApiResponse.success(hangVeList));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HangVe>> getHangVeById(@PathVariable int id) {
        try {
            HangVe hangVe = hangVeService.findById(id);
            return ResponseEntity.ok(ApiResponse.success(hangVe));
        } catch (Exception e) {
            return ResponseEntity.status(404)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HangVe>> createHangVe(@RequestBody HangVe hangVe) {
        try {
            HangVe createdHangVe = hangVeService.createHangVe(hangVe);
            return ResponseEntity.ok(ApiResponse.success(createdHangVe));
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HangVe>> updateHangVe(
            @PathVariable int id,
            @RequestBody HangVe hangVe) {
        try {
            HangVe updatedHangVe = hangVeService.updateHangVe(id, hangVe);
            return ResponseEntity.ok(ApiResponse.success(updatedHangVe));
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHangVe(@PathVariable int id) {
        try {
            hangVeService.deleteHangVe(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
