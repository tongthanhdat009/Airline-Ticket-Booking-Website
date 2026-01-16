package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.HangVe;
import com.example.j2ee.service.HangVeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public API cho hạng vé - chỉ cho phép đọc (read-only)
 * API này không cần authentication và chỉ trả về các hạng vé đang hoạt động
 */
@RestController
@RequestMapping("/api/hangve")
public class HangVeController {

    private final HangVeService hangVeService;

    public HangVeController(HangVeService hangVeService) {
        this.hangVeService = hangVeService;
    }

    /**
     * Lấy danh sách tất cả hạng vé đang hoạt động
     * Public API - không cần authentication
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<HangVe>>> getAllHangVe() {
        List<HangVe> hangVeList = hangVeService.findAll();
        return ResponseEntity.ok(ApiResponse.success(hangVeList));
    }

    /**
     * Lấy thông tin hạng vé theo ID
     * Public API - không cần authentication
     */
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
}
