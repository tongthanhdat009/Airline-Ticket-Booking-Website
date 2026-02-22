package com.example.j2ee.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.ChuyenBayWithSeatsDTO;
import com.example.j2ee.model.GiaChuyenBay;
import com.example.j2ee.model.SanBay;
import com.example.j2ee.service.ChiTietGheService;
import com.example.j2ee.service.DichVuCungCapService;
import com.example.j2ee.service.GiaChuyenBayService;
import com.example.j2ee.service.SanBayService;

@RestController
@RequestMapping("/sanbay")
public class SanBayController {
    private final SanBayService sanBayService;
    private final GiaChuyenBayService giaChuyenBayService;
    private final ChiTietGheService chiTietGheService;
    private final DichVuCungCapService dichVuCungCapService;

    public SanBayController(SanBayService sanBayService, GiaChuyenBayService giaChuyenBayService, ChiTietGheService chiTietGheService, DichVuCungCapService dichVuCungCapService) {
        this.sanBayService = sanBayService;
        this.giaChuyenBayService = giaChuyenBayService;
        this.chiTietGheService = chiTietGheService;
        this.dichVuCungCapService = dichVuCungCapService;
    }

    @GetMapping("/{thanhPhoSanBay}")
    public ResponseEntity<ApiResponse<SanBay>> getSanBayById(@PathVariable String thanhPhoSanBay) {
        SanBay sanBay = sanBayService.getSanBayByThanhPhoSanBay(thanhPhoSanBay);
        return ResponseEntity.ok(ApiResponse.success(sanBay));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SanBay>>> getAllSanBay() {
        List<SanBay> sanBayList = sanBayService.getAllSanBay();
        return ResponseEntity.ok(ApiResponse.success(sanBayList));
    }

    @GetMapping("/{sanBayDi}/{sanBayDen}/{ngayDi}")
    public ResponseEntity<ApiResponse<List<?>>> getChuyenBaysByRouteAndDate(
            @PathVariable String sanBayDi,
            @PathVariable String sanBayDen,
            @PathVariable LocalDate ngayDi) {
        List<?> results = sanBayService.getChuyenBays(sanBayDi, sanBayDen, ngayDi);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    /**
     * API mới: Lấy danh sách chuyến bay kèm thông tin ghế trống
     * Yêu cầu: Số ghế trống = Tổng ghế của máy bay - COUNT(ghe_da_dat của chuyến đó)
     * Chỉ hiển thị chuyến bay còn ghế trống
     */
    @GetMapping("/{sanBayDi}/{sanBayDen}/{ngayDi}/with-seats")
    public ResponseEntity<ApiResponse<List<ChuyenBayWithSeatsDTO>>> getChuyenBaysWithAvailableSeats(
            @PathVariable String sanBayDi,
            @PathVariable String sanBayDen,
            @PathVariable LocalDate ngayDi) {
        List<ChuyenBayWithSeatsDTO> results = sanBayService.getChuyenBaysWithSeats(sanBayDi, sanBayDen, ngayDi);
        return ResponseEntity.ok(ApiResponse.success(results));
    }
    @GetMapping("/chitiet/{maChuyenBay}")
    public ResponseEntity<ApiResponse<?>> getChiTietGheByChuyenBay(@PathVariable int maChuyenBay) {
        Object result = chiTietGheService.getAvailableSeatsForFlight(maChuyenBay);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Lấy toàn bộ sơ đồ ghế của chuyến bay (cả ghế đã đặt và chưa đặt)
     * Trả về danh sách SoDoGheDTO với field daDat
     */
    @GetMapping("/sodoghe/{maChuyenBay}")
    public ResponseEntity<ApiResponse<?>> getSoDoGheByChuyenBay(@PathVariable int maChuyenBay) {
        Object result = chiTietGheService.getSoDoGheForFlight(maChuyenBay);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/giave/{maChuyenBay}/{maHangVe}")
    public ResponseEntity<ApiResponse<?>> getGiaVeByChuyenBayAndHangVe(
            @PathVariable int maChuyenBay,
            @PathVariable int maHangVe) {
        GiaChuyenBay result = giaChuyenBayService.getGiaVeByChuyenBayAndHangVe(maChuyenBay, maHangVe);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
    @GetMapping("/dichvu/{maChuyenBay}")
    public ResponseEntity<ApiResponse<?>> getDichVuCungCapMaChuyenBay(@PathVariable Integer maChuyenBay) {
        Object result = dichVuCungCapService.getDichVuTheoChuyenBay( maChuyenBay);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
    @GetMapping("/chitietdichvu/{maDichVu}")
    public ResponseEntity<ApiResponse<?>> getDichVuCungCapByMaDichVu(@PathVariable Integer maDichVu) {
        Object result = dichVuCungCapService.getLuaChonByDichVuId( maDichVu);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
    @GetMapping("/{maChuyenBay}/hang-ve/{maHangVe}/{soLuongNguoi}")
    public ResponseEntity<ApiResponse<Boolean>> kiemTraConGhe(
            @PathVariable Long maChuyenBay,
            @PathVariable Long maHangVe,
            @PathVariable Integer soLuongNguoi) {
        boolean conGhe = chiTietGheService.coGheTrong(maChuyenBay, maHangVe, soLuongNguoi);
        return ResponseEntity.ok(new ApiResponse<>(true, "Kiểm tra thành công", conGhe));
    }
}
