package com.example.j2ee.controller;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.TuyenBay;
import com.example.j2ee.service.TuyenBayService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/dashboard/tuyenbay")
public class QuanLyTuyenBayController {
    private final TuyenBayService tuyenBayService;

    public QuanLyTuyenBayController(TuyenBayService tuyenBayService) {
        this.tuyenBayService = tuyenBayService;
    }

    @GetMapping
    @RequirePermission(feature = "ROUTE", action = "VIEW")
    public ResponseEntity<ApiResponse<List<TuyenBay>>> getAllTuyenBay() {
        List<TuyenBay> tuyenBayList = tuyenBayService.getAllTuyenBay();
        return ResponseEntity.ok(ApiResponse.success(tuyenBayList));
    }

    @GetMapping("/{id}")
    @RequirePermission(feature = "ROUTE", action = "VIEW")
    public ResponseEntity<ApiResponse<TuyenBay>> getTuyenBayById(@PathVariable int id) {
        TuyenBay tuyenBay = tuyenBayService.getTuyenBayById(id);
        if (tuyenBay == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy tuyến bay"));
        }
        return ResponseEntity.ok(ApiResponse.success(tuyenBay));
    }

    @PostMapping
    @RequirePermission(feature = "ROUTE", action = "CREATE")
    public ResponseEntity<ApiResponse<TuyenBay>> createTuyenBay(@RequestBody TuyenBay tuyenBay) {
        TuyenBay created = tuyenBayService.createTuyenBay(tuyenBay);
        if (created == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(
                            "Dữ liệu không hợp lệ hoặc sân bay không tồn tại/trùng nhau hoặc tuyến bay đã tồn tại"));
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo tuyến bay thành công", created));
    }

    @DeleteMapping("/{maTuyenBay}")
    @RequirePermission(feature = "ROUTE", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteTuyenBay(@PathVariable int maTuyenBay) {
        String error = tuyenBayService.deleteTuyenBay(maTuyenBay);
        if (error == null) {
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa tuyến bay thành công"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(error));
        }
    }

    @PutMapping
    @RequirePermission(feature = "ROUTE", action = "UPDATE")
    public ResponseEntity<ApiResponse<Void>> updateTuyenBay(@RequestBody TuyenBay tuyenBay) {
        String error = tuyenBayService.updateTuyenBay(tuyenBay);
        if (error == null) {
            return ResponseEntity.ok(ApiResponse.successMessage("Sửa thông tin tuyến bay thành công"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(error));
        }
    }
}