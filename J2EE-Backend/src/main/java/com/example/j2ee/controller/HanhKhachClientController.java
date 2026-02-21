package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.HanhKhach;
import com.example.j2ee.service.HanhKhachService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller cho client cập nhật thông tin HanhKhach
 * Không yêu cầu quyền admin, chỉ cần authenticated
 */
@RestController
@RequestMapping("/hanhkhach")
public class HanhKhachClientController {

    private final HanhKhachService hanhKhachService;

    public HanhKhachClientController(HanhKhachService hanhKhachService) {
        this.hanhKhachService = hanhKhachService;
    }

    /**
     * API cập nhật thông tin hành khách theo ID
     * PUT /hanhkhach/{id}
     *
     * @param id Mã hành khách
     * @param body Map chứa các field cần cập nhật
     * @return HanhKhach đã cập nhật
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HanhKhach>> updateHanhKhach(
            @PathVariable int id,
            @RequestBody Map<String, Object> body) {

        try {
            // Convert Map to HanhKhach entity
            HanhKhach hanhKhach = new HanhKhach();

            if (body.containsKey("hoVaTen")) {
                hanhKhach.setHoVaTen((String) body.get("hoVaTen"));
            }
            if (body.containsKey("gioiTinh")) {
                hanhKhach.setGioiTinh((String) body.get("gioiTinh"));
            }
            if (body.containsKey("ngaySinh")) {
                String ngaySinhStr = (String) body.get("ngaySinh");
                if (ngaySinhStr != null && !ngaySinhStr.trim().isEmpty()) {
                    try {
                        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
                        hanhKhach.setNgaySinh(new java.sql.Date(sdf.parse(ngaySinhStr).getTime()));
                    } catch (Exception e) {
                        return ResponseEntity.badRequest()
                                .body(ApiResponse.error("Định dạng ngày sinh không hợp lệ. Vui lòng sử dụng định dạng yyyy-MM-dd"));
                    }
                }
            }
            if (body.containsKey("soDienThoai")) {
                hanhKhach.setSoDienThoai((String) body.get("soDienThoai"));
            }
            if (body.containsKey("email")) {
                hanhKhach.setEmail((String) body.get("email"));
            }
            if (body.containsKey("maDinhDanh")) {
                hanhKhach.setMaDinhDanh((String) body.get("maDinhDanh"));
            }
            if (body.containsKey("diaChi")) {
                hanhKhach.setDiaChi((String) body.get("diaChi"));
            }
            if (body.containsKey("quocGia")) {
                hanhKhach.setQuocGia((String) body.get("quocGia"));
            }

            var updated = hanhKhachService.updateHanhKhach(id, hanhKhach);

            return updated
                    .map(hk -> ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin hành khách thành công", hk)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.error("Không tìm thấy hành khách với id: " + id)));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi cập nhật thông tin hành khách: " + ex.getMessage()));
        }
    }
}
