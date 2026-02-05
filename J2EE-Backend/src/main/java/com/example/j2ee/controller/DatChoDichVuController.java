package com.example.j2ee.controller;

import com.example.j2ee.model.DatChoDichVu;
import com.example.j2ee.repository.DatChoDichVuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/admin/dashboard/datcho")
@RequiredArgsConstructor
public class DatChoDichVuController {

    private final DatChoDichVuRepository datChoDichVuRepository;

    /**
     * Lấy danh sách dịch vụ đã đặt theo mã đặt chỗ
     * Endpoint: GET /admin/dashboard/datcho/{maDatCho}/dichvu
     */
    @GetMapping("/{maDatCho}/dichvu")
    public ResponseEntity<?> getDichVuByMaDatCho(@PathVariable int maDatCho) {
        try {
            List<DatChoDichVu> danhSachDichVu = datChoDichVuRepository.findByDatCho_MaDatCho(maDatCho);
            
            // Chuyển đổi sang DTO để tránh circular reference và lazy loading issues
            List<Map<String, Object>> response = new ArrayList<>();
            
            for (DatChoDichVu dcdv : danhSachDichVu) {
                Map<String, Object> dichVuMap = new HashMap<>();
                dichVuMap.put("soLuong", dcdv.getSoLuong());
                dichVuMap.put("donGia", dcdv.getDonGia());
                
                // Thông tin lựa chọn dịch vụ
                if (dcdv.getLuaChonDichVu() != null) {
                    Map<String, Object> luaChonMap = new HashMap<>();
                    luaChonMap.put("maLuaChon", dcdv.getLuaChonDichVu().getMaLuaChon());
                    luaChonMap.put("tenLuaChon", dcdv.getLuaChonDichVu().getTenLuaChon());
                    luaChonMap.put("moTa", dcdv.getLuaChonDichVu().getMoTa());
                    luaChonMap.put("gia", dcdv.getLuaChonDichVu().getGia());
                    luaChonMap.put("anh", dcdv.getLuaChonDichVu().getAnh());
                    
                    // Thông tin dịch vụ cung cấp
                    if (dcdv.getLuaChonDichVu().getDichVuCungCap() != null) {
                        Map<String, Object> dichVuCungCapMap = new HashMap<>();
                        dichVuCungCapMap.put("maDichVu", dcdv.getLuaChonDichVu().getDichVuCungCap().getMaDichVu());
                        dichVuCungCapMap.put("tenDichVu", dcdv.getLuaChonDichVu().getDichVuCungCap().getTenDichVu());
                        dichVuCungCapMap.put("moTa", dcdv.getLuaChonDichVu().getDichVuCungCap().getMoTa());
                        dichVuCungCapMap.put("anh", dcdv.getLuaChonDichVu().getDichVuCungCap().getAnh());
                        
                        luaChonMap.put("dichVu", dichVuCungCapMap);
                    }
                    
                    dichVuMap.put("luaChonDichVu", luaChonMap);
                }
                
                response.add(dichVuMap);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi khi lấy danh sách dịch vụ: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}