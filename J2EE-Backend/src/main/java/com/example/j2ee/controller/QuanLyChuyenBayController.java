package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.ChiTietChuyenBay;
import com.example.j2ee.model.DichVuCungCap;
import com.example.j2ee.service.ChiTietChuyenBayService;
import com.example.j2ee.service.GheService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/admin/dashboard/chuyenbay")
public class QuanLyChuyenBayController {

    private final ChiTietChuyenBayService chiTietChuyenBayService;
    private final GheService gheService;

    public QuanLyChuyenBayController(ChiTietChuyenBayService chiTietChuyenBayService,
                                    GheService gheService) {
        this.chiTietChuyenBayService = chiTietChuyenBayService;
        this.gheService = gheService;
    }

    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<ChiTietChuyenBay>> getChuyenBayById(@PathVariable int id) {
        if(!chiTietChuyenBayService.getChiTietChuyenBayById(id).isPresent()){
            return new ResponseEntity<>(ApiResponse.error("Không tìm thấy chi tiết chuyến bay"), HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(ApiResponse.success(chiTietChuyenBayService.getChiTietChuyenBayById(id).get()));
    }
    @GetMapping
    public ResponseEntity<ApiResponse<Iterable<ChiTietChuyenBay>>> getAllChuyenBay() {
        Iterable<ChiTietChuyenBay> chuyenBayList = chiTietChuyenBayService.getAllChiTietChuyenBay();
        return ResponseEntity.ok(ApiResponse.success(chuyenBayList));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ChiTietChuyenBay>> createChuyenBay(@RequestBody ChiTietChuyenBay body) {
        String msg = chiTietChuyenBayService.createChiTietChuyenBay(body);
        if ("Thêm chi tiết chuyến bay thành công".equals(msg)) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(body));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(msg));
    }

    @PostMapping("/{maChuyenBay}/ghe")
    public ResponseEntity<ApiResponse<Void>> addGheToChuyenBay(
            @PathVariable int maChuyenBay,
            @RequestBody Map<String, Integer> soGheTheoHangVe) {
        try {
            // Lấy thông tin chuyến bay để lấy mã máy bay
            var chuyenBayOpt = chiTietChuyenBayService.getChiTietChuyenBayById(maChuyenBay);
            if (chuyenBayOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Chuyến bay không tồn tại: " + maChuyenBay));
            }
            
            ChiTietChuyenBay chuyenBay = chuyenBayOpt.get();
            if (chuyenBay.getMayBay() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Chuyến bay chưa có máy bay được gán"));
            }
            
            int maMayBay = chuyenBay.getMayBay().getMaMayBay();
            String msg = gheService.addGheToMayBay(maMayBay, soGheTheoHangVe);
            if (msg.contains("thành công")) {
                return ResponseEntity.ok(ApiResponse.successMessage(msg));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Lỗi khi thêm ghế: " + e.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<ApiResponse<Void>> updateChuyenBay(@RequestBody ChiTietChuyenBay body) {
        String msg = chiTietChuyenBayService.updateChiTietChuyenBay(body);
        if ("Sửa chi tiết chuyến bay thành công".equals(msg)) {
            return ResponseEntity.ok(ApiResponse.successMessage(msg));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(msg));
    }

    @PutMapping("/trangthai")
    public ResponseEntity<ApiResponse<Void>> updateTrangThaiChuyenBay(@RequestParam("maChuyenBay") int maChuyenBay, @RequestParam("trangThai") String trangThai) {
        String msg = chiTietChuyenBayService.updateTrangThaiChuyenBay(maChuyenBay, trangThai);
        if ("Cập nhật trạng thái chuyến bay thành công".equals(msg)) {
            return ResponseEntity.ok(ApiResponse.successMessage(msg));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(msg));
    }

    @PutMapping("/delay")
    public ResponseEntity<ApiResponse<Void>> updateDelay(@RequestBody Map<String, Object> delayData) {
        try {
            int maChuyenBay = (Integer) delayData.get("maChuyenBay");
            String lyDoDelay = (String) delayData.get("lyDoDelay");
            LocalDateTime thoiGianDiThucTe = delayData.get("thoiGianDiThucTe") != null ? LocalDateTime.ofInstant(Instant.ofEpochMilli((Long) delayData.get("thoiGianDiThucTe")), ZoneId.systemDefault()) : null;
            LocalDateTime thoiGianDenThucTe = delayData.get("thoiGianDenThucTe") != null ? LocalDateTime.ofInstant(Instant.ofEpochMilli((Long) delayData.get("thoiGianDenThucTe")), ZoneId.systemDefault()) : null;

            String msg = chiTietChuyenBayService.updateDelay(maChuyenBay, lyDoDelay, thoiGianDiThucTe, thoiGianDenThucTe);
            if ("Cập nhật delay thành công".equals(msg)) {
                return ResponseEntity.ok(ApiResponse.successMessage(msg));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Dữ liệu không hợp lệ: " + e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteChuyenBay(@RequestBody ChiTietChuyenBay body) {
        String msg = chiTietChuyenBayService.deleteChiTietChuyenBay(body);
        if ("Xóa chi tiết chuyến bay thành công".equals(msg)) {
            return ResponseEntity.ok(ApiResponse.successMessage(msg));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(msg));
    }

    @PutMapping("/huychuyen")
    public ResponseEntity<ApiResponse<Void>> cancelChuyenBay(@RequestBody Map<String, Object> cancelData) {
        try {
            int maChuyenBay = (Integer) cancelData.get("maChuyenBay");
            String lyDoHuy = (String) cancelData.get("lyDoHuy");

            String msg = chiTietChuyenBayService.updateCancel(maChuyenBay, lyDoHuy);
            if ("Cập nhật hủy chuyến thành công".equals(msg)) {
                return ResponseEntity.ok(ApiResponse.successMessage(msg));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Dữ liệu không hợp lệ: " + e.getMessage()));
        }
    }

    // Lấy danh sách dịch vụ của chuyến bay
    @GetMapping("/{maChuyenBay}/dichvu")
    public ResponseEntity<ApiResponse<Set<DichVuCungCap>>> getDichVuByChuyenBay(@PathVariable int maChuyenBay) {
        try {
            Set<DichVuCungCap> dichVuList = chiTietChuyenBayService.getDichVuByChuyenBay(maChuyenBay);
            return ResponseEntity.ok(ApiResponse.success(dichVuList));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách dịch vụ: " + e.getMessage()));
        }
    }

    // Thêm dịch vụ vào chuyến bay
    @PostMapping("/{maChuyenBay}/dichvu/{maDichVu}")
    public ResponseEntity<ApiResponse<Void>> addDichVuToChuyenBay(
            @PathVariable int maChuyenBay,
            @PathVariable int maDichVu) {
        try {
            String msg = chiTietChuyenBayService.addDichVuToChuyenBay(maChuyenBay, maDichVu);
            return ResponseEntity.ok(ApiResponse.successMessage(msg));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi thêm dịch vụ: " + e.getMessage()));
        }
    }

    // Xóa dịch vụ khỏi chuyến bay
    @DeleteMapping("/{maChuyenBay}/dichvu/{maDichVu}")
    public ResponseEntity<ApiResponse<Void>> removeDichVuFromChuyenBay(
            @PathVariable int maChuyenBay,
            @PathVariable int maDichVu) {
        try {
            String msg = chiTietChuyenBayService.removeDichVuFromChuyenBay(maChuyenBay, maDichVu);
            return ResponseEntity.ok(ApiResponse.successMessage(msg));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi xóa dịch vụ: " + e.getMessage()));
        }
    }

    // ==================== SOFT DELETE ENDPOINTS ====================

    /**
     * Lấy danh sách tất cả các chuyến bay đã bị xóa (soft delete)
     */
    @GetMapping("/deleted")
    public ResponseEntity<ApiResponse<Iterable<ChiTietChuyenBay>>> getAllDeletedChuyenBay() {
        try {
            Iterable<ChiTietChuyenBay> deletedChuyenBayList = chiTietChuyenBayService.getAllDeletedChiTietChuyenBay();
            return ResponseEntity.ok(ApiResponse.success(deletedChuyenBayList));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách chuyến bay đã xóa: " + e.getMessage()));
        }
    }

    /**
     * Khôi phục một chuyến bay đã bị xóa
     * @param maChuyenBay Mã chuyến bay cần khôi phục
     * @return Thông báo kết quả
     */
    @PutMapping("/{maChuyenBay}/restore")
    public ResponseEntity<ApiResponse<ChiTietChuyenBay>> restoreChuyenBay(@PathVariable int maChuyenBay) {
        try {
            String msg = chiTietChuyenBayService.restoreChiTietChuyenBay(maChuyenBay);
            if ("Khôi phục chuyến bay thành công".equals(msg)) {
                var chuyenBayOpt = chiTietChuyenBayService.getChiTietChuyenBayById(maChuyenBay);
                if (chuyenBayOpt.isPresent()) {
                    return ResponseEntity.ok(ApiResponse.success(chuyenBayOpt.get(), msg));
                }
                return ResponseEntity.ok(ApiResponse.successMessage(msg));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi khôi phục chuyến bay: " + e.getMessage()));
        }
    }
}
