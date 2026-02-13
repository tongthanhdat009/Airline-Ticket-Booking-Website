package com.example.j2ee.controller;

import com.example.j2ee.dto.AddServiceRequest;
import com.example.j2ee.model.*;
import com.example.j2ee.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/client/dichvu")
@RequiredArgsConstructor
public class ClientDichVuController {

    private final DatChoRepository datChoRepository;
    private final DichVuChuyenBayRepository dichVuChuyenBayRepository;
    private final LuaChonDichVuRepository luaChonDichVuRepository;
    private final DatChoDichVuRepository datChoDichVuRepository;
    private final TrangThaiThanhToanRepository trangThaiThanhToanRepository;

    /**
     * Lấy danh sách dịch vụ khả dụng cho chuyến bay theo mã đặt chỗ
     */
    @GetMapping("/available/{maDatCho}")
    public ResponseEntity<Map<String, Object>> getAvailableServices(@PathVariable int maDatCho) {
        try {
            // Lấy thông tin đặt chỗ
            DatCho datCho = datChoRepository.findById(maDatCho).orElse(null);
            
            if (datCho == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Không tìm thấy đặt chỗ");
                return ResponseEntity.status(404).body(errorResponse);
            }
            
            // Lấy mã chuyến bay trực tiếp từ đặt chỗ
            int maChuyenBay = datCho.getChuyenBay().getMaChuyenBay();
            
            // Lấy danh sách dịch vụ của chuyến bay
            List<DichVuChuyenBay> dichVuChuyenBay = dichVuChuyenBayRepository.findByChiTietChuyenBay_MaChuyenBay(maChuyenBay);
            
            List<Map<String, Object>> services = new ArrayList<>();
            
            for (DichVuChuyenBay dvcb : dichVuChuyenBay) {
                DichVuCungCap dichVu = dvcb.getDichVuCungCap();
                
                Map<String, Object> serviceMap = new HashMap<>();
                serviceMap.put("maDichVu", dichVu.getMaDichVu());
                serviceMap.put("tenDichVu", dichVu.getTenDichVu());
                serviceMap.put("moTa", dichVu.getMoTa());
                serviceMap.put("anh", dichVu.getAnh());
                
                // Lấy các lựa chọn của dịch vụ
                List<LuaChonDichVu> luaChonList = luaChonDichVuRepository.findByDichVuCungCap_MaDichVu(dichVu.getMaDichVu());
                List<Map<String, Object>> options = new ArrayList<>();
                
                for (LuaChonDichVu luaChon : luaChonList) {
                    Map<String, Object> optionMap = new HashMap<>();
                    optionMap.put("maLuaChon", luaChon.getMaLuaChon());
                    optionMap.put("tenLuaChon", luaChon.getTenLuaChon());
                    optionMap.put("moTa", luaChon.getMoTa());
                    optionMap.put("gia", luaChon.getGia());
                    optionMap.put("anh", luaChon.getAnh());
                    options.add(optionMap);
                }
                
                serviceMap.put("luaChon", options);
                services.add(serviceMap);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy danh sách dịch vụ thành công");
            response.put("data", services);
            response.put("datCho", Map.of(
                "maDatCho", datCho.getMaDatCho(),
                "maChuyenBay", maChuyenBay,
                "tenHanhKhach", datCho.getHanhKhach().getHoVaTen()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi lấy danh sách dịch vụ: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Lấy danh sách dịch vụ đã đặt của khách hàng
     */
    @GetMapping("/booked/{maDatCho}")
    public ResponseEntity<Map<String, Object>> getBookedServices(@PathVariable int maDatCho) {
        try {
            List<DatChoDichVu> danhSachDichVu = datChoDichVuRepository.findByDatCho_MaDatCho(maDatCho);
            
            List<Map<String, Object>> services = new ArrayList<>();
            
            for (DatChoDichVu dcdv : danhSachDichVu) {
                Map<String, Object> serviceMap = new HashMap<>();
                serviceMap.put("soLuong", dcdv.getSoLuong());
                serviceMap.put("donGia", dcdv.getDonGia());
                
                if (dcdv.getLuaChonDichVu() != null) {
                    LuaChonDichVu luaChon = dcdv.getLuaChonDichVu();
                    Map<String, Object> luaChonMap = new HashMap<>();
                    luaChonMap.put("maLuaChon", luaChon.getMaLuaChon());
                    luaChonMap.put("tenLuaChon", luaChon.getTenLuaChon());
                    luaChonMap.put("moTa", luaChon.getMoTa());
                    luaChonMap.put("gia", luaChon.getGia());
                    luaChonMap.put("anh", luaChon.getAnh());
                    
                    if (luaChon.getDichVuCungCap() != null) {
                        DichVuCungCap dv = luaChon.getDichVuCungCap();
                        luaChonMap.put("tenDichVu", dv.getTenDichVu());
                        luaChonMap.put("anhDichVu", dv.getAnh());
                    }
                    
                    serviceMap.put("luaChon", luaChonMap);
                }
                
                services.add(serviceMap);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy danh sách dịch vụ đã đặt thành công");
            response.put("data", services);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi lấy danh sách dịch vụ: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Thêm dịch vụ vào đặt chỗ
     */
    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addService(@RequestBody AddServiceRequest request) {
        try {
            int maDatCho = request.getMaDatCho();
            int maLuaChon = request.getMaLuaChon();
            int soLuong = request.getSoLuong() > 0 ? request.getSoLuong() : 1;
            
            // Kiểm tra đặt chỗ
            DatCho datCho = datChoRepository.findById(maDatCho).orElse(null);
            if (datCho == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Không tìm thấy đặt chỗ");
                return ResponseEntity.status(404).body(errorResponse);
            }
            
            // Kiểm tra lựa chọn dịch vụ
            LuaChonDichVu luaChon = luaChonDichVuRepository.findById(maLuaChon).orElse(null);
            if (luaChon == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Không tìm thấy dịch vụ");
                return ResponseEntity.status(404).body(errorResponse);
            }
            
            // Tạo đặt chỗ dịch vụ mới
            DatChoDichVu datChoDichVu = new DatChoDichVu();
            DatChoDichVuId id = new DatChoDichVuId();
            id.setMaDatCho(maDatCho);
            id.setMaLuaChon(maLuaChon);
            
            datChoDichVu.setId(id);
            datChoDichVu.setDatCho(datCho);
            datChoDichVu.setLuaChonDichVu(luaChon);
            datChoDichVu.setSoLuong(soLuong);
            datChoDichVu.setDonGia(luaChon.getGia());
            
            datChoDichVuRepository.save(datChoDichVu);
            
            // Cập nhật tổng tiền thanh toán (thông qua DonHang)
            TrangThaiThanhToan thanhToan = datCho.getDonHang() != null 
                ? trangThaiThanhToanRepository.findByDonHang_MaDonHang(datCho.getDonHang().getMaDonHang()) 
                : null;
            if (thanhToan != null) {
                BigDecimal giaDichVu = luaChon.getGia().multiply(new BigDecimal(soLuong));
                BigDecimal tongTienMoi = thanhToan.getSoTien().add(giaDichVu);
                thanhToan.setSoTien(tongTienMoi);
                trangThaiThanhToanRepository.save(thanhToan);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Thêm dịch vụ thành công");
            response.put("tongTien", thanhToan != null ? thanhToan.getSoTien() : 0);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi thêm dịch vụ: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
