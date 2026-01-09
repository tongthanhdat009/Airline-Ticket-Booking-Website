package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.HangVe;
import com.example.j2ee.service.HangVeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/dashboard/hangve")
public class QuanLyHangVeController {
    private final HangVeService hangVeService;

    public QuanLyHangVeController(HangVeService hangVeService) {
        this.hangVeService = hangVeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HangVe>>> getAllHangVe(){
        List<HangVe> hangVeList = hangVeService.findAll();
        return ResponseEntity.ok(ApiResponse.success(hangVeList));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HangVe>> updateHangVe(@PathVariable int id, @RequestBody HangVe hangVe){
        try{
            HangVe updateHangVe = hangVeService.updateHangVe(id, hangVe);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật hạng vé thành công", updateHangVe));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}