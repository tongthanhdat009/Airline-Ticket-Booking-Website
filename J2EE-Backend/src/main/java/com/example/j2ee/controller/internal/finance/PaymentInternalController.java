package com.example.j2ee.controller.internal.finance;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.TrangThaiThanhToan;
import com.example.j2ee.repository.TrangThaiThanhToanRepository;
import com.example.j2ee.service.JasperInvoiceService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Internal API Controller for Payment Management
 * Base URL: /internal/payments
 * 
 * Provides internal/admin APIs for payment management.
 * JWT Authentication Required.
 */
@RestController
@RequestMapping("/internal/payments")
public class PaymentInternalController {

    private final TrangThaiThanhToanRepository thanhToanRepository;
    private final JasperInvoiceService jasperInvoiceService;

    public PaymentInternalController(TrangThaiThanhToanRepository thanhToanRepository,
                                     JasperInvoiceService jasperInvoiceService) {
        this.thanhToanRepository = thanhToanRepository;
        this.jasperInvoiceService = jasperInvoiceService;
    }

    // ==================== READ ENDPOINTS ====================

    /**
     * GET /internal/payments - Get all payments
     */
    @GetMapping
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<ApiResponse<List<TrangThaiThanhToan>>> getAllPayments() {
        try {
            List<TrangThaiThanhToan> payments = thanhToanRepository.findAll();
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thanh toán thành công", payments));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy danh sách thanh toán: " + e.getMessage()));
        }
    }

    /**
     * GET /internal/payments/{id} - Get payment by ID with full details
     */
    @GetMapping("/{id}")
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPaymentById(@PathVariable int id) {
        try {
            Optional<TrangThaiThanhToan> paymentOpt = thanhToanRepository.findById(id);
            
            if (paymentOpt.isPresent()) {
                TrangThaiThanhToan payment = paymentOpt.get();
                
                Map<String, Object> response = new HashMap<>();
                response.put("maThanhToan", payment.getMaThanhToan());
                response.put("soTien", payment.getSoTien());
                response.put("daThanhToan", payment.getDaThanhToan());
                response.put("ngayHetHan", payment.getNgayHetHan());
                
                DatCho datCho = payment.getDatCho();
                if (datCho != null) {
                    Map<String, Object> datChoInfo = new HashMap<>();
                    datChoInfo.put("maDatCho", datCho.getMaDatCho());
                    datChoInfo.put("ngayDatCho", datCho.getNgayDatCho());
                    
                    if (datCho.getHanhKhach() != null) {
                        Map<String, Object> hanhKhachInfo = new HashMap<>();
                        hanhKhachInfo.put("maHanhKhach", datCho.getHanhKhach().getMaHanhKhach());
                        hanhKhachInfo.put("hoVaTen", datCho.getHanhKhach().getHoVaTen());
                        hanhKhachInfo.put("email", datCho.getHanhKhach().getEmail());
                        hanhKhachInfo.put("soDienThoai", datCho.getHanhKhach().getSoDienThoai());
                        hanhKhachInfo.put("gioiTinh", datCho.getHanhKhach().getGioiTinh());
                        hanhKhachInfo.put("ngaySinh", datCho.getHanhKhach().getNgaySinh());
                        hanhKhachInfo.put("quocGia", datCho.getHanhKhach().getQuocGia());
                        datChoInfo.put("hanhKhach", hanhKhachInfo);
                    }
                    
                    if (datCho.getChiTietGhe() != null) {
                        Map<String, Object> gheInfo = new HashMap<>();
                        gheInfo.put("maGhe", datCho.getChiTietGhe().getMaGhe());
                        gheInfo.put("soGhe", datCho.getChiTietGhe().getSoGhe());
                        
                        if (datCho.getChiTietGhe().getHangVe() != null) {
                            Map<String, Object> hangVeInfo = new HashMap<>();
                            hangVeInfo.put("maHangVe", datCho.getChiTietGhe().getHangVe().getMaHangVe());
                            hangVeInfo.put("tenHangVe", datCho.getChiTietGhe().getHangVe().getTenHangVe());
                            gheInfo.put("hangVe", hangVeInfo);
                        }
                        
                        datChoInfo.put("chiTietGhe", gheInfo);
                    }
                    
                    if (datCho.getChuyenBay() != null) {
                        Map<String, Object> chuyenBayInfo = new HashMap<>();
                        chuyenBayInfo.put("maChuyenBay", datCho.getChuyenBay().getMaChuyenBay());
                        chuyenBayInfo.put("soHieuChuyenBay", datCho.getChuyenBay().getSoHieuChuyenBay());
                        chuyenBayInfo.put("ngayDi", datCho.getChuyenBay().getNgayDi());
                        chuyenBayInfo.put("gioDi", datCho.getChuyenBay().getGioDi());
                        chuyenBayInfo.put("ngayDen", datCho.getChuyenBay().getNgayDen());
                        chuyenBayInfo.put("gioDen", datCho.getChuyenBay().getGioDen());
                        chuyenBayInfo.put("trangThai", datCho.getChuyenBay().getTrangThai());
                        
                        if (datCho.getChuyenBay().getTuyenBay() != null) {
                            Map<String, Object> tuyenBayInfo = new HashMap<>();
                            tuyenBayInfo.put("maTuyenBay", datCho.getChuyenBay().getTuyenBay().getMaTuyenBay());
                            
                            if (datCho.getChuyenBay().getTuyenBay().getSanBayDi() != null) {
                                Map<String, Object> sanBayDi = new HashMap<>();
                                sanBayDi.put("maSanBay", datCho.getChuyenBay().getTuyenBay().getSanBayDi().getMaSanBay());
                                sanBayDi.put("tenSanBay", datCho.getChuyenBay().getTuyenBay().getSanBayDi().getTenSanBay());
                                sanBayDi.put("maIATA", datCho.getChuyenBay().getTuyenBay().getSanBayDi().getMaIATA());
                                tuyenBayInfo.put("sanBayDi", sanBayDi);
                            }
                            
                            if (datCho.getChuyenBay().getTuyenBay().getSanBayDen() != null) {
                                Map<String, Object> sanBayDen = new HashMap<>();
                                sanBayDen.put("maSanBay", datCho.getChuyenBay().getTuyenBay().getSanBayDen().getMaSanBay());
                                sanBayDen.put("tenSanBay", datCho.getChuyenBay().getTuyenBay().getSanBayDen().getTenSanBay());
                                sanBayDen.put("maIATA", datCho.getChuyenBay().getTuyenBay().getSanBayDen().getMaIATA());
                                tuyenBayInfo.put("sanBayDen", sanBayDen);
                            }
                            
                            chuyenBayInfo.put("tuyenBay", tuyenBayInfo);
                        }
                        
                        datChoInfo.put("chuyenBay", chuyenBayInfo);
                    }
                    
                    response.put("datCho", datChoInfo);
                }
                
                return ResponseEntity.ok(ApiResponse.success("Lấy thông tin thanh toán thành công", response));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy thanh toán với ID: " + id));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thông tin thanh toán: " + e.getMessage()));
        }
    }

    /**
     * GET /internal/payments/status/{status} - Get payments by status
     */
    @GetMapping("/status/{status}")
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<ApiResponse<List<TrangThaiThanhToan>>> getPaymentsByStatus(@PathVariable String status) {
        try {
            char daThanhToan;
            if ("paid".equalsIgnoreCase(status)) {
                daThanhToan = 'Y';
            } else if ("pending".equalsIgnoreCase(status)) {
                daThanhToan = 'N';
            } else {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Trạng thái không hợp lệ. Chỉ chấp nhận 'paid' hoặc 'pending'"));
            }
            
            List<TrangThaiThanhToan> payments = thanhToanRepository.findByDaThanhToan(daThanhToan);
            return ResponseEntity.ok(ApiResponse.success("Lấy thanh toán theo trạng thái thành công", payments));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi lấy thanh toán theo trạng thái: " + e.getMessage()));
        }
    }

    // ==================== UPDATE ENDPOINTS ====================

    /**
     * PUT /internal/payments/{id}/status - Update payment status
     */
    @PutMapping("/{id}/status")
    @RequirePermission(feature = "ORDER", action = "UPDATE")
    public ResponseEntity<ApiResponse<TrangThaiThanhToan>> updatePaymentStatus(
            @PathVariable int id,
            @RequestBody Map<String, Object> payload) {
        try {
            TrangThaiThanhToan payment = thanhToanRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thanh toán với ID: " + id));

            String statusStr = (String) payload.get("daThanhToan");
            if (statusStr == null || statusStr.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Trạng thái thanh toán không được để trống"));
            }

            char newStatus = statusStr.charAt(0);
            if (newStatus != 'Y' && newStatus != 'N') {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Trạng thái thanh toán chỉ có thể là 'Y' (đã thanh toán) hoặc 'N' (đang xử lý)"));
            }

            payment.setDaThanhToan(newStatus);
            TrangThaiThanhToan updatedPayment = thanhToanRepository.save(payment);

            return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thanh toán thành công", updatedPayment));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi cập nhật trạng thái thanh toán: " + e.getMessage()));
        }
    }

    // ==================== DELETE ENDPOINTS ====================

    /**
     * DELETE /internal/payments/{id} - Delete payment
     */
    @DeleteMapping("/{id}")
    @RequirePermission(feature = "ORDER", action = "DELETE")
    public ResponseEntity<ApiResponse<Void>> deletePayment(@PathVariable int id) {
        try {
            if (!thanhToanRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Không tìm thấy thanh toán với ID: " + id));
            }

            thanhToanRepository.deleteById(id);
            
            return ResponseEntity.ok(ApiResponse.successMessage("Xóa thanh toán thành công"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi xóa thanh toán: " + e.getMessage()));
        }
    }

    // ==================== EXPORT ENDPOINTS ====================

    /**
     * GET /internal/payments/{id}/invoice - Download invoice PDF
     */
    @GetMapping("/{id}/invoice")
    @RequirePermission(feature = "ORDER", action = "VIEW")
    public ResponseEntity<?> downloadInvoice(@PathVariable int id) {
        try {
            byte[] pdfBytes = jasperInvoiceService.generateInvoicePdf(id);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "invoice-" + id + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error generating invoice: " + e.getMessage()));
        }
    }
}
