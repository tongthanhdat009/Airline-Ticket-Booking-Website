package com.example.j2ee.controller;

import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.TrangThaiThanhToan;
import com.example.j2ee.repository.TrangThaiThanhToanRepository;
import com.example.j2ee.service.JasperInvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/admin/dashboard/thanhtoan")
@RequiredArgsConstructor
public class ThanhToanController {

    private final TrangThaiThanhToanRepository thanhToanRepository;
    private final JasperInvoiceService jasperInvoiceService;

    // Lấy tất cả thanh toán
    @GetMapping
    public ResponseEntity<?> getAllThanhToan() {
        try {
            List<TrangThaiThanhToan> danhSachThanhToan = thanhToanRepository.findAll();
            return ResponseEntity.ok(danhSachThanhToan);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi khi lấy danh sách thanh toán: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Lấy thanh toán theo ID với đầy đủ thông tin chi tiết
    @GetMapping("/{id}")
    public ResponseEntity<?> getThanhToanById(@PathVariable int id) {
        try {
            Optional<TrangThaiThanhToan> thanhToanOpt = thanhToanRepository.findById(id);
            
            if (thanhToanOpt.isPresent()) {
                TrangThaiThanhToan thanhToan = thanhToanOpt.get();
                
                // Tạo response với thông tin chi tiết
                Map<String, Object> response = new HashMap<>();
                response.put("maThanhToan", thanhToan.getMaThanhToan());
                response.put("soTien", thanhToan.getSoTien());
                response.put("daThanhToan", thanhToan.getDaThanhToan());
                response.put("ngayHetHan", thanhToan.getNgayHetHan());
                
                // Thông tin đặt chỗ
                DatCho datCho = thanhToan.getDatCho();
                if (datCho != null) {
                    Map<String, Object> datChoInfo = new HashMap<>();
                    datChoInfo.put("maDatCho", datCho.getMaDatCho());
                    datChoInfo.put("ngayDatCho", datCho.getNgayDatCho());
                    
                    // Thông tin hành khách
                    if (datCho.getHanhKhach() != null) {
                        Map<String, Object> hanhKhachInfo = new HashMap<>();
                        hanhKhachInfo.put("maHanhKhach", datCho.getHanhKhach().getMaHanhKhach());
                        hanhKhachInfo.put("hoVaTen", datCho.getHanhKhach().getHoVaTen());
                        hanhKhachInfo.put("email", datCho.getHanhKhach().getEmail());
                        hanhKhachInfo.put("soDienThoai", datCho.getHanhKhach().getSoDienThoai());
                        hanhKhachInfo.put("gioiTinh", datCho.getHanhKhach().getGioiTinh());
                        hanhKhachInfo.put("ngaySinh", datCho.getHanhKhach().getNgaySinh());
                        hanhKhachInfo.put("quocGia", datCho.getHanhKhach().getQuocGia());
                        hanhKhachInfo.put("maDinhDanh", datCho.getHanhKhach().getMaDinhDanh());
                        hanhKhachInfo.put("diaChi", datCho.getHanhKhach().getDiaChi());
                        datChoInfo.put("hanhKhach", hanhKhachInfo);
                    }
                    
                    // Thông tin ghế đã đặt
                    if (datCho.getChiTietGhe() != null) {
                        Map<String, Object> gheInfo = new HashMap<>();
                        gheInfo.put("maGhe", datCho.getChiTietGhe().getMaGhe());
                        gheInfo.put("soGhe", datCho.getChiTietGhe().getSoGhe());
                        
                        // Thông tin hạng vé từ ghế
                        if (datCho.getChiTietGhe().getHangVe() != null) {
                            Map<String, Object> hangVeInfo = new HashMap<>();
                            hangVeInfo.put("maHangVe", datCho.getChiTietGhe().getHangVe().getMaHangVe());
                            hangVeInfo.put("tenHangVe", datCho.getChiTietGhe().getHangVe().getTenHangVe());
                            hangVeInfo.put("sucChua", datCho.getChiTietGhe().getHangVe().getSucChua());
                            gheInfo.put("hangVe", hangVeInfo);
                        }
                        
                        datChoInfo.put("chiTietGhe", gheInfo);
                    }
                    
                    // Thông tin hạng vé từ đặt chỗ
                    if (datCho.getHangVe() != null) {
                        Map<String, Object> hangVeInfo = new HashMap<>();
                        hangVeInfo.put("maHangVe", datCho.getHangVe().getMaHangVe());
                        hangVeInfo.put("tenHangVe", datCho.getHangVe().getTenHangVe());
                        hangVeInfo.put("sucChua", datCho.getHangVe().getSucChua());
                        datChoInfo.put("hangVe", hangVeInfo);
                    }
                    
                    // Thông tin chuyến bay - lấy trực tiếp từ datCho
                    if (datCho.getChuyenBay() != null) {
                        Map<String, Object> chuyenBayInfo = new HashMap<>();
                        chuyenBayInfo.put("maChuyenBay", datCho.getChuyenBay().getMaChuyenBay());
                        chuyenBayInfo.put("soHieuChuyenBay", datCho.getChuyenBay().getSoHieuChuyenBay());
                        chuyenBayInfo.put("ngayDi", datCho.getChuyenBay().getNgayDi());
                        chuyenBayInfo.put("gioDi", datCho.getChuyenBay().getGioDi());
                        chuyenBayInfo.put("ngayDen", datCho.getChuyenBay().getNgayDen());
                        chuyenBayInfo.put("gioDen", datCho.getChuyenBay().getGioDen());
                        chuyenBayInfo.put("trangThai", datCho.getChuyenBay().getTrangThai());
                        
                        // Thông tin tuyến bay
                        if (datCho.getChuyenBay().getTuyenBay() != null) {
                            Map<String, Object> tuyenBayInfo = new HashMap<>();
                            tuyenBayInfo.put("maTuyenBay", datCho.getChuyenBay().getTuyenBay().getMaTuyenBay());
                            
                            // Sân bay đi
                            if (datCho.getChuyenBay().getTuyenBay().getSanBayDi() != null) {
                                Map<String, Object> sanBayDi = new HashMap<>();
                                sanBayDi.put("maSanBay", datCho.getChuyenBay().getTuyenBay().getSanBayDi().getMaSanBay());
                                sanBayDi.put("tenSanBay", datCho.getChuyenBay().getTuyenBay().getSanBayDi().getTenSanBay());
                                sanBayDi.put("maIATA", datCho.getChuyenBay().getTuyenBay().getSanBayDi().getMaIATA());
                                sanBayDi.put("thanhPho", datCho.getChuyenBay().getTuyenBay().getSanBayDi().getThanhPhoSanBay());
                                sanBayDi.put("quocGia", datCho.getChuyenBay().getTuyenBay().getSanBayDi().getQuocGiaSanBay());
                                tuyenBayInfo.put("sanBayDi", sanBayDi);
                            }
                            
                            // Sân bay đến
                            if (datCho.getChuyenBay().getTuyenBay().getSanBayDen() != null) {
                                Map<String, Object> sanBayDen = new HashMap<>();
                                sanBayDen.put("maSanBay", datCho.getChuyenBay().getTuyenBay().getSanBayDen().getMaSanBay());
                                sanBayDen.put("tenSanBay", datCho.getChuyenBay().getTuyenBay().getSanBayDen().getTenSanBay());
                                sanBayDen.put("maIATA", datCho.getChuyenBay().getTuyenBay().getSanBayDen().getMaIATA());
                                sanBayDen.put("thanhPho", datCho.getChuyenBay().getTuyenBay().getSanBayDen().getThanhPhoSanBay());
                                sanBayDen.put("quocGia", datCho.getChuyenBay().getTuyenBay().getSanBayDen().getQuocGiaSanBay());
                                tuyenBayInfo.put("sanBayDen", sanBayDen);
                            }
                            
                            chuyenBayInfo.put("tuyenBay", tuyenBayInfo);
                        }
                        
                        datChoInfo.put("chuyenBay", chuyenBayInfo);
                    }
                    
                    // Thông tin dịch vụ đã chọn (nếu có)
                    if (datCho.getDanhSachDichVu() != null && !datCho.getDanhSachDichVu().isEmpty()) {
                        List<Map<String, Object>> dichVuList = new ArrayList<>();
                        datCho.getDanhSachDichVu().forEach(dv -> {
                            Map<String, Object> dichVuInfo = new HashMap<>();
                            dichVuInfo.put("maLuaChon", dv.getLuaChonDichVu().getMaLuaChon());
                            dichVuInfo.put("tenLuaChon", dv.getLuaChonDichVu().getTenLuaChon());
                            dichVuInfo.put("soLuong", dv.getSoLuong());
                            dichVuInfo.put("donGia", dv.getDonGia());
                            dichVuInfo.put("thanhTien", dv.getDonGia().multiply(java.math.BigDecimal.valueOf(dv.getSoLuong())));
                            
                            if (dv.getLuaChonDichVu().getDichVuCungCap() != null) {
                                dichVuInfo.put("tenDichVu", dv.getLuaChonDichVu().getDichVuCungCap().getTenDichVu());
                            }
                            
                            dichVuList.add(dichVuInfo);
                        });
                        datChoInfo.put("danhSachDichVu", dichVuList);
                    }
                    
                    response.put("datCho", datChoInfo);
                }
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Không tìm thấy thanh toán với ID: " + id);
                return ResponseEntity.status(404).body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi khi lấy thông tin thanh toán: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Lấy thanh toán theo trạng thái
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getThanhToanByStatus(@PathVariable String status) {
        try {
            char daThanhToan;
            if ("paid".equalsIgnoreCase(status)) {
                daThanhToan = 'Y';
            } else if ("pending".equalsIgnoreCase(status)) {
                daThanhToan = 'N';
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Trạng thái không hợp lệ. Chỉ chấp nhận 'paid' hoặc 'pending'");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            List<TrangThaiThanhToan> danhSachThanhToan = thanhToanRepository.findByDaThanhToan(daThanhToan);
            return ResponseEntity.ok(danhSachThanhToan);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi khi lấy thanh toán theo trạng thái: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Cập nhật trạng thái thanh toán
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateThanhToanStatus(@PathVariable int id, @RequestBody Map<String, Object> payload) {
        try {
            TrangThaiThanhToan thanhToan = thanhToanRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thanh toán với ID: " + id));

            String statusStr = (String) payload.get("daThanhToan");
            if (statusStr == null || statusStr.isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Trạng thái thanh toán không được để trống");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            char newStatus = statusStr.charAt(0);
            if (newStatus != 'Y' && newStatus != 'N') {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Trạng thái thanh toán chỉ có thể là 'Y' (đã thanh toán) hoặc 'N' (đang xử lý)");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            thanhToan.setDaThanhToan(newStatus);
            TrangThaiThanhToan updatedThanhToan = thanhToanRepository.save(thanhToan);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cập nhật trạng thái thanh toán thành công");
            response.put("data", updatedThanhToan);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi khi cập nhật trạng thái thanh toán: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Xóa thanh toán (nên cẩn trọng khi sử dụng)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteThanhToan(@PathVariable int id) {
        try {
            if (!thanhToanRepository.existsById(id)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Không tìm thấy thanh toán với ID: " + id);
                return ResponseEntity.status(404).body(errorResponse);
            }

            thanhToanRepository.deleteById(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Xóa thanh toán thành công");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi khi xóa thanh toán: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Xuất hóa đơn PDF sử dụng JasperReports
     * Endpoint: GET /admin/dashboard/thanhtoan/{id}/invoice
     */
    @GetMapping("/{id}/invoice")
    public ResponseEntity<?> downloadInvoice(@PathVariable int id) {
        try {
            byte[] pdfBytes = jasperInvoiceService.generateInvoicePdf(id);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "invoice-" + id + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
            
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (IllegalStateException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error generating invoice: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
}
