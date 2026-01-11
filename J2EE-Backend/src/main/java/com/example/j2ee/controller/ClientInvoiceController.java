package com.example.j2ee.controller;

import com.example.j2ee.model.*;
import com.example.j2ee.repository.*;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/client/invoice")
public class ClientInvoiceController {

    @Autowired
    private TrangThaiThanhToanRepository trangThaiThanhToanRepository;

    @GetMapping("/pdf/{maThanhToan}")
    public ResponseEntity<byte[]> generateInvoicePdf(@PathVariable int maThanhToan) {
        try {
            // Lấy thông tin thanh toán
            TrangThaiThanhToan thanhToan = trangThaiThanhToanRepository.findById(maThanhToan)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán"));
            
            DatCho datCho = thanhToan.getDatCho();
            if (datCho == null) {
                throw new RuntimeException("Không tìm thấy thông tin đặt chỗ");
            }

            // Load jasper template
            InputStream reportStream = new ClassPathResource("jasper/invoice_report.jrxml").getInputStream();
            JasperReport jasperReport = JasperCompileManager.compileReport(reportStream);

            // Prepare parameters
            Map<String, Object> parameters = new HashMap<>();
            
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
            
            // Invoice info
            parameters.put("invoiceNumber", String.format("INV-%06d", maThanhToan));
            parameters.put("invoiceDate", LocalDate.now().format(dateFormatter));
            parameters.put("paymentStatus", thanhToan.getDaThanhToan() == 'Y' ? "PAID" : "UNPAID");
            parameters.put("paymentDate", thanhToan.getDaThanhToan() == 'Y' ? LocalDate.now().format(dateFormatter) : "N/A");
            
            // Customer info
            HanhKhach hanhKhach = datCho.getHanhKhach();
            parameters.put("customerName", hanhKhach.getHoVaTen());
            parameters.put("customerEmail", hanhKhach.getEmail() != null ? hanhKhach.getEmail() : "N/A");
            parameters.put("customerPhone", hanhKhach.getSoDienThoai() != null ? hanhKhach.getSoDienThoai() : "N/A");
            
            // Booking info
            parameters.put("bookingId", String.format("BK-%06d", datCho.getMaDatCho()));
            
            // Flight info - lấy trực tiếp từ datCho
            ChiTietChuyenBay chuyenBay = datCho.getChuyenBay();
            TuyenBay tuyenBay = chuyenBay.getTuyenBay();
            HangVe hangVe = datCho.getHangVe();
            ChiTietGhe chiTietGhe = datCho.getChiTietGhe();
            
            parameters.put("flightNumber", chuyenBay.getSoHieuChuyenBay());
            parameters.put("route", tuyenBay.getSanBayDi().getThanhPhoSanBay() + " → " + tuyenBay.getSanBayDen().getThanhPhoSanBay());
            parameters.put("departureDate", chuyenBay.getNgayDi().format(dateFormatter));
            parameters.put("departureTime", chuyenBay.getGioDi().format(timeFormatter));
            parameters.put("ticketClass", hangVe.getTenHangVe());
            
            // Prepare service items data
            List<Map<String, Object>> items = new ArrayList<>();
            int rowNum = 1;
            
            // The payment amount already includes everything (ticket + services)
            BigDecimal totalAmount = thanhToan.getSoTien();
            
            // Calculate services total first
            BigDecimal servicesTotalAmount = BigDecimal.ZERO;
            Set<DatChoDichVu> dichVuList = datCho.getDanhSachDichVu();
            if (dichVuList != null && !dichVuList.isEmpty()) {
                for (DatChoDichVu dichVu : dichVuList) {
                    BigDecimal amount = dichVu.getDonGia().multiply(BigDecimal.valueOf(dichVu.getSoLuong()));
                    servicesTotalAmount = servicesTotalAmount.add(amount);
                }
            }
            
            // Calculate ticket price (total - services)
            // Note: This assumes total already includes tax
            BigDecimal ticketPrice = totalAmount.subtract(servicesTotalAmount);
            
            // Add flight ticket as first item
            Map<String, Object> ticketItem = new HashMap<>();
            ticketItem.put("rowNumber", rowNum++);
            ticketItem.put("description", "Flight Ticket" + (chiTietGhe != null ? " - Seat " + chiTietGhe.getSoGhe() : ""));
            ticketItem.put("quantity", "1");
            ticketItem.put("unitPrice", ticketPrice);
            ticketItem.put("amount", ticketPrice);
            items.add(ticketItem);
            
            // Add services
            if (dichVuList != null && !dichVuList.isEmpty()) {
                for (DatChoDichVu dichVu : dichVuList) {
                    BigDecimal amount = dichVu.getDonGia().multiply(BigDecimal.valueOf(dichVu.getSoLuong()));
                    
                    Map<String, Object> serviceItem = new HashMap<>();
                    serviceItem.put("rowNumber", rowNum++);
                    serviceItem.put("description", dichVu.getLuaChonDichVu().getDichVuCungCap().getTenDichVu() + 
                                                  " - " + dichVu.getLuaChonDichVu().getTenLuaChon());
                    serviceItem.put("quantity", String.valueOf(dichVu.getSoLuong()));
                    serviceItem.put("unitPrice", dichVu.getDonGia());
                    serviceItem.put("amount", amount);
                    items.add(serviceItem);
                }
            }
            
            // Use the payment amount as the final total
            // Calculate subtotal and tax (assuming tax is 10% of total)
            BigDecimal total = totalAmount;
            BigDecimal subtotal = total.divide(BigDecimal.valueOf(1.10), 2, java.math.RoundingMode.HALF_UP);
            BigDecimal tax = total.subtract(subtotal);
            
            parameters.put("subtotal", subtotal);
            parameters.put("tax", tax);
            parameters.put("total", total);
            
            // Create data source
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(items);
            
            // Fill report
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);
            
            // Export to PDF
            byte[] pdfBytes = JasperExportManager.exportReportToPdf(jasperPrint);
            
            // Return PDF
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                String.format("invoice_%s.pdf", maThanhToan));
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
                
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
