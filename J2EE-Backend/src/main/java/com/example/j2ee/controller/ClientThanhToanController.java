package com.example.j2ee.controller;

import com.example.j2ee.model.TrangThaiThanhToan;
import com.example.j2ee.model.DatCho;
import com.example.j2ee.repository.TrangThaiThanhToanRepository;
import com.example.j2ee.repository.DatChoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Date;
import java.util.Calendar;

@RestController
@RequestMapping("/client/thanhtoan")
public class ClientThanhToanController {

    @Autowired
    private TrangThaiThanhToanRepository trangThaiThanhToanRepository;

    @Autowired
    private DatChoRepository datChoRepository;

    /**
     * Lấy lịch sử thanh toán của hành khách theo mã hành khách
     */
    @GetMapping("/hanhkhach/{maHanhKhach}")
    public ResponseEntity<Map<String, Object>> getLichSuThanhToan(@PathVariable int maHanhKhach) {
        try {
            // Lấy tất cả thanh toán và filter theo mã hành khách
            List<TrangThaiThanhToan> allPayments = trangThaiThanhToanRepository.findAll();
            
            List<TrangThaiThanhToan> lichSuThanhToan = allPayments.stream()
                .filter(payment -> payment.getDatCho() != null 
                    && payment.getDatCho().getHanhKhach() != null
                    && payment.getDatCho().getHanhKhach().getMaHanhKhach() == maHanhKhach)
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy lịch sử thanh toán thành công");
            response.put("data", lichSuThanhToan);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi lấy lịch sử thanh toán: " + e.getMessage());
            errorResponse.put("data", null);
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Lấy chi tiết thanh toán theo mã thanh toán
     */
    @GetMapping("/{maThanhToan}")
    public ResponseEntity<Map<String, Object>> getThanhToanById(@PathVariable int maThanhToan) {
        try {
            TrangThaiThanhToan thanhToan = trangThaiThanhToanRepository.findById(maThanhToan).orElse(null);
            
            if (thanhToan == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Không tìm thấy thanh toán");
                errorResponse.put("data", null);
                
                return ResponseEntity.status(404).body(errorResponse);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy chi tiết thanh toán thành công");
            response.put("data", thanhToan);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi lấy chi tiết thanh toán: " + e.getMessage());
            errorResponse.put("data", null);
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Tạo thông tin thanh toán mới
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createThanhToan(@RequestBody Map<String, Object> request) {
        try {
            TrangThaiThanhToan thanhToan = new TrangThaiThanhToan();
            
            // Set số tiền
            if (request.containsKey("soTien")) {
                Object soTienObj = request.get("soTien");
                BigDecimal soTien;
                if (soTienObj instanceof Integer) {
                    soTien = BigDecimal.valueOf((Integer) soTienObj);
                } else if (soTienObj instanceof Double) {
                    soTien = BigDecimal.valueOf((Double) soTienObj);
                } else if (soTienObj instanceof BigDecimal) {
                    soTien = (BigDecimal) soTienObj;
                } else {
                    soTien = new BigDecimal(soTienObj.toString());
                }
                thanhToan.setSoTien(soTien);
            }
            
            // Set trạng thái thanh toán (mặc định là chưa thanh toán = 'N')
            thanhToan.setDaThanhToan('N');
            
            // Set ngày hết hạn (15 phút sau khi tạo)
            Calendar calendar = Calendar.getInstance();
            calendar.add(Calendar.MINUTE, 15);
            thanhToan.setNgayHetHan(calendar.getTime());
            
            // Nếu có maDatCho thì set (không bắt buộc)
            if (request.containsKey("maDatCho") && request.get("maDatCho") != null) {
                Integer maDatCho = (Integer) request.get("maDatCho");
                DatCho datCho = datChoRepository.findById(maDatCho).orElse(null);
                if (datCho != null) {
                    thanhToan.setDatCho(datCho);
                }
            }
            // Không set maDatCho nếu chưa có - sẽ được cập nhật sau
            
            // Lưu vào database
            TrangThaiThanhToan savedThanhToan = trangThaiThanhToanRepository.save(thanhToan);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tạo thông tin thanh toán thành công");
            response.put("data", savedThanhToan);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi tạo thanh toán: " + e.getMessage());
            errorResponse.put("data", null);
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
