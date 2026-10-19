package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.datcho.CreateBookingRequest;
import com.example.j2ee.dto.datcho.CreateBookingResponse;
import com.example.j2ee.dto.datcho.DatChoDetailResponse;
import com.example.j2ee.dto.datcho.DatChoSearchRequest;
import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.DonHang;
import com.example.j2ee.model.HanhKhach;
import com.example.j2ee.model.ChiTietGhe;
import com.example.j2ee.model.TrangThaiThanhToan;
import com.example.j2ee.repository.DatChoRepository;
import com.example.j2ee.repository.DonHangRepository;
import com.example.j2ee.repository.HanhKhachRepository;
import com.example.j2ee.repository.ChiTietGheRepository;
import com.example.j2ee.repository.TrangThaiThanhToanRepository;
import com.example.j2ee.repository.GheDaDatRepository;
import com.example.j2ee.service.DatChoService;
import com.example.j2ee.service.HanhKhachService;
import com.example.j2ee.service.BookingService;
import com.example.j2ee.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/client/datcho")
@RequiredArgsConstructor
public class ClientDatChoController {

    private final DatChoService datChoService;
    private final DatChoRepository datChoRepository;
    private final DonHangRepository donHangRepository;
    private final HanhKhachRepository hanhKhachRepository;
    private final ChiTietGheRepository chiTietGheRepository;
    private final TrangThaiThanhToanRepository trangThaiThanhToanRepository;
    private final GheDaDatRepository gheDaDatRepository;
    private final HanhKhachService hanhKhachService;
    private final BookingService bookingService;

    /**
     * Lấy danh sách đặt chỗ của hành khách theo mã hành khách
     */
    @GetMapping("/hanhkhach/{maHanhKhach}")
    public ResponseEntity<ApiResponse<List<DatCho>>> getDatChoByHanhKhach(@PathVariable int maHanhKhach) {
        try {
            // Fix D-9 (IDOR đọc): chỉ chính chủ mới được liệt kê đặt chỗ của mình.
            HanhKhach hk = hanhKhachRepository.findById(maHanhKhach).orElse(null);
            if (hk == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy hành khách"));
            }
            if (!SecurityUtil.isOwnerOf(hk)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Bạn không có quyền xem đặt chỗ của hành khách này"));
            }
            List<DatCho> danhSachDatCho = datChoService.getDatChoByHanhKhach(maHanhKhach);
            return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách đặt chỗ thành công", danhSachDatCho)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi lấy danh sách đặt chỗ: " + e.getMessage()));
        }
    }

    /**
     * Lấy chi tiết đặt chỗ theo mã đặt chỗ
     */
    @GetMapping("/{maDatCho}")
    public ResponseEntity<ApiResponse<DatCho>> getDatChoById(@PathVariable int maDatCho) {
        try {
            DatCho datCho = datChoService.getDatChoById(maDatCho)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đặt chỗ"));
            // Fix D-9 (IDOR đọc): chỉ chính chủ mới được xem chi tiết đặt chỗ của mình.
            // Khách guest tra cứu bằng mã + tên qua /search (proof-of-knowledge).
            if (!SecurityUtil.isOwnerOf(datCho.getHanhKhach())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Bạn không có quyền xem đặt chỗ này"));
            }
            
            return ResponseEntity.ok(
                ApiResponse.success("Lấy chi tiết đặt chỗ thành công", datCho)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi lấy chi tiết đặt chỗ: " + e.getMessage()));
        }
    }

    /**
     * Hủy đặt chỗ (xóa đặt chỗ và các giao dịch liên quan)
     */
    @DeleteMapping("/{maDatCho}")
    public ResponseEntity<ApiResponse<Void>> huyDatCho(@PathVariable int maDatCho) {
        try {
            // Fix D-10 (IDOR ghi): chỉ chính chủ mới được hủy đặt chỗ của mình.
            DatCho datCho = datChoService.getDatChoById(maDatCho).orElse(null);
            if (datCho == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy đặt chỗ"));
            }
            if (!SecurityUtil.isOwnerOf(datCho.getHanhKhach())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Bạn không có quyền hủy đặt chỗ này"));
            }
            datChoService.huyDatCho(maDatCho);
            return ResponseEntity.ok(ApiResponse.successMessage("Hủy đặt chỗ thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi hủy đặt chỗ: " + e.getMessage()));
        }
    }

    /**
     * Tìm kiếm đặt chỗ theo mã đặt chỗ và tên hành khách
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<DatChoDetailResponse>> searchDatCho(
            @Valid @ModelAttribute DatChoSearchRequest request) {
        try {
            DatChoDetailResponse response = datChoService.searchDatCho(
                request.getMaDatCho(), 
                request.getTenHanhKhach()
            );
            
            return ResponseEntity.ok(
                ApiResponse.success("Tìm kiếm thành công", response)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi tìm kiếm: " + e.getMessage()));
        }
    }

    /**
     * Tạo đặt chỗ mới với thông tin hành khách và thanh toán
     * Hỗ trợ đặt cho nhiều hành khách cùng lúc
     * Logic nghiệp vụ đã được chuyển sang BookingService
     */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<CreateBookingResponse>> createBooking(
            @Valid @RequestBody CreateBookingRequest request) {
        try {
            // Delegate business logic sang BookingService
            CreateBookingResponse response = bookingService.createBooking(request);
            
            return ResponseEntity.ok(
                ApiResponse.success(
                    "Tạo đặt chỗ thành công cho " + response.getDanhSachMaDatCho().size() + " hành khách", 
                    response
                )
            );
        } catch (IllegalArgumentException e) {
            // Business validation errors (ghế đã đặt, số lượng không khớp, độ dài text field, etc.)
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Fix D-30: trùng unique (kể cả race double-submit) → 409 sanitized, không lộ SQL.
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(resolveDuplicateMessage(e)));
        } catch (Exception e) {
            // Fix D-30: unwrap Duplicate/unique ở cause chain (commit-time) → 409; còn lại 500 generic.
            String duplicateMessage = resolveDuplicateMessage(e);
            if (duplicateMessage != null) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(duplicateMessage));
            }
            org.slf4j.LoggerFactory.getLogger(ClientDatChoController.class)
                .error("Lỗi khi tạo đặt chỗ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Đã xảy ra lỗi hệ thống, vui lòng thử lại sau"));
        }
    }

    /**
     * Map lỗi trùng unique constraint sang thông báo thân thiện, không lộ SQL.
     * Trả về null nếu không phải lỗi trùng lặp.
     */
    static String resolveDuplicateMessage(Throwable e) {
        StringBuilder all = new StringBuilder();
        for (Throwable t = e; t != null; t = t.getCause()) {
            if (t.getMessage() != null) {
                all.append(t.getMessage()).append('\n');
            }
        }
        String m = all.toString();
        if (!(m.contains("Duplicate entry") || m.contains("UK_") || m.contains("unique") || m.contains("Unique"))) {
            return null;
        }
        if (m.contains("UK_madinhdanh") || (m.contains("madinhdanh") && m.contains("Duplicate"))) {
            return "CCCD/CMND/Hộ chiếu này đã được sử dụng cho hành khách khác, vui lòng kiểm tra lại thông tin";
        }
        if (m.contains("UK_chuyenbay_ghe") || (m.contains("ghe_da_dat") && m.contains("Duplicate"))) {
            return "Ghế vừa được giữ bởi một giao dịch khác (có thể do bấm thanh toán 2 lần), vui lòng kiểm tra lại đơn hàng của bạn";
        }
        if (m.contains("UK_pnr") || (m.contains("UK_") && m.contains("pnr"))) {
            return "Mã đơn hàng bị trùng, vui lòng thử lại";
        }
        if (m.contains("UK_thanhtoan_donhang")) {
            return "Đơn hàng này đã có thông tin thanh toán, vui lòng kiểm tra lại lịch sử giao dịch";
        }
        return "Dữ liệu bị trùng lặp, vui lòng kiểm tra lại thông tin";
    }
}
