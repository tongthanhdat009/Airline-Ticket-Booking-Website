package com.example.j2ee.controller; // Hoặc package controller của bạn

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.ChuyenBayKhachHangDTO;
import com.example.j2ee.dto.DoiMatKhauRequest;
import com.example.j2ee.dto.TaiKhoanKhachHangDTO;
import com.example.j2ee.dto.UpdateKhachHangRequest;
import com.example.j2ee.model.HanhKhach;
import com.example.j2ee.service.HanhKhachService;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/admin/dashboard/hanhkhach") // Tiền tố chung cho tất cả các API trong controller này
public class QuanLyHanhKhachController {

    private final HanhKhachService hanhKhachService;

    public QuanLyHanhKhachController(HanhKhachService hanhKhachService) {
        this.hanhKhachService = hanhKhachService;
    }

    /**
     * GET: /admin/dashboard/hanhkhach
     */
    @GetMapping
    @RequirePermission(feature = "CUSTOMER", action = "VIEW")
    public ResponseEntity<List<HanhKhach>> getAllHanhKhach() {
        List<HanhKhach> hanhKhachList = hanhKhachService.getAllHanhKhach();
        return ResponseEntity.ok(hanhKhachList); // Trả về status 200 OK và danh sách
    }

    /**
     * GET: /admin/dashboard/hanhkhach/{id}
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "CUSTOMER", action = "VIEW")
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
    @RequirePermission(feature = "CUSTOMER", action = "CREATE")
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
    @RequirePermission(feature = "CUSTOMER", action = "UPDATE")
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
    @RequirePermission(feature = "CUSTOMER", action = "DELETE")
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
    @RequirePermission(feature = "CUSTOMER", action = "VIEW")
    public ResponseEntity<ApiResponse<List<ChuyenBayKhachHangDTO>>> getChuyenBayByKhachHang(@PathVariable int id) {
        try {
            List<ChuyenBayKhachHangDTO> chuyenBayList = hanhKhachService.getChuyenBayByKhachHang(id);
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách chuyến bay thành công", chuyenBayList));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách chuyến bay: " + ex.getMessage()));
        }
    }

    // ==================== NEW ENDPOINTS FOR VIEW CUSTOMER MODAL ====================

    /**
     * GET: /admin/dashboard/hanhkhach/{id}/tai-khoan
     * Lấy thông tin tài khoản của khách hàng
     */
    @GetMapping("/{id}/tai-khoan")
    @RequirePermission(feature = "CUSTOMER", action = "VIEW")
    public ResponseEntity<ApiResponse<TaiKhoanKhachHangDTO>> getTaiKhoanKhachHang(@PathVariable int id) {
        try {
            var taiKhoanOpt = hanhKhachService.getTaiKhoanKhachHang(id);
            if (taiKhoanOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy thông tin tài khoản của khách hàng"));
            }
            return ResponseEntity.ok(ApiResponse.success("Lấy thông tin tài khoản thành công", taiKhoanOpt.get()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thông tin tài khoản: " + ex.getMessage()));
        }
    }

    /**
     * PUT: /admin/dashboard/hanhkhach/{id}/partial
     * Cập nhật một phần thông tin khách hàng
     */
    @PutMapping("/{id}/partial")
    @RequirePermission(feature = "CUSTOMER", action = "UPDATE")
    public ResponseEntity<ApiResponse<HanhKhach>> updateKhachHangPartial(
            @PathVariable int id,
            @RequestBody @Valid UpdateKhachHangRequest request) {
        try {
            Optional<HanhKhach> updated = hanhKhachService.updateKhachHangPartial(id, request);
            return updated
                    .map(hk -> ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin khách hàng thành công", hk)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.error("Không tìm thấy khách hàng với id: " + id)));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi cập nhật thông tin khách hàng: " + ex.getMessage()));
        }
    }

    /**
     * PUT: /admin/dashboard/hanhkhach/{id}/doi-mat-khau
     * Đổi mật khẩu cho khách hàng (thực hiện bởi admin)
     */
    @PutMapping("/{id}/doi-mat-khau")
    @RequirePermission(feature = "CUSTOMER", action = "UPDATE")
    public ResponseEntity<ApiResponse<String>> doiMatKhauKhachHang(
            @PathVariable int id,
            @RequestBody @Valid DoiMatKhauRequest request) {
        try {
            boolean success = hanhKhachService.doiMatKhauKhachHang(id, request.getMatKhauMoi());
            if (success) {
                return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", "Mật khẩu đã được cập nhật"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy tài khoản của khách hàng"));
            }
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi đổi mật khẩu: " + ex.getMessage()));
        }
    }
}