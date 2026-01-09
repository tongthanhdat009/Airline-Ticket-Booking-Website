package com.example.j2ee.controller; // Hoặc package controller của bạn

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.ChuyenBayKhachHangDTO;
import com.example.j2ee.model.HanhKhach;
import com.example.j2ee.service.HanhKhachService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("admin/dashboard/hanhkhach") // Tiền tố chung cho tất cả các API trong controller này
public class QuanLyHanhKhachController {

    private final HanhKhachService hanhKhachService;

    public QuanLyHanhKhachController(HanhKhachService hanhKhachService) {
        this.hanhKhachService = hanhKhachService;
    }

    /**
     * GET: /admin/dashboard/hanhkhach
     */
    @GetMapping
    public ResponseEntity<List<HanhKhach>> getAllHanhKhach() {
        List<HanhKhach> hanhKhachList = hanhKhachService.getAllHanhKhach();
        return ResponseEntity.ok(hanhKhachList); // Trả về status 200 OK và danh sách
    }

    /**
     * GET: /admin/dashboard/hanhkhach/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<HanhKhach> getHanhKhachById(@PathVariable int id) {
        Optional<HanhKhach> hanhKhachOptional = hanhKhachService.getHanhKhachById(id);
        return hanhKhachOptional
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * POST: /admin/dashboard/hanhkhach
     * Body JSON theo entity HanhKhach
     */
    @PostMapping
    public ResponseEntity<ApiResponse<HanhKhach>> create(@RequestBody HanhKhach body) {
        try {
            HanhKhach created = hanhKhachService.createHanhKhach(body);
            return ResponseEntity.created(URI.create("/admin/dashboard/hanhkhach/" + created.getMaHanhKhach()))
                    .body(ApiResponse.success("Tạo hành khách thành công", created));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(ex.getMessage()));
        }
    }

    /**
     * PUT: /admin/dashboard/hanhkhach/{id}
     * Body JSON theo entity HanhKhach
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HanhKhach>> update(@PathVariable int id, @RequestBody HanhKhach body) {
        try {
            Optional<HanhKhach> updated = hanhKhachService.updateHanhKhach(id, body);
            return updated
                    .map(hk -> ResponseEntity.ok(ApiResponse.success("Cập nhật hành khách thành công", hk)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.error("Không tìm thấy hành khách với id: " + id)));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(ex.getMessage()));
        }
    }

    /**
     * DELETE: /admin/dashboard/hanhkhach/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        boolean deleted = hanhKhachService.deleteHanhKhach(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * GET: /admin/dashboard/hanhkhach/{id}/chuyenbay
     * Lấy danh sách chuyến bay của khách hàng
     */
    @GetMapping("/{id}/chuyenbay")
    public ResponseEntity<ApiResponse<List<ChuyenBayKhachHangDTO>>> getChuyenBayByKhachHang(@PathVariable int id) {
        try {
            List<ChuyenBayKhachHangDTO> chuyenBayList = hanhKhachService.getChuyenBayByKhachHang(id);
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách chuyến bay thành công", chuyenBayList));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách chuyến bay: " + ex.getMessage()));
        }
    }
}