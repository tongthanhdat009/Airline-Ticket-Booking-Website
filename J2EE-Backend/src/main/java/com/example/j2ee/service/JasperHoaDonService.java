package com.example.j2ee.service;

import com.example.j2ee.model.HoaDon;
import com.example.j2ee.repository.HoaDonRepository;
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Service for generating HoaDon PDFs using JasperReports
 */
@Service
@RequiredArgsConstructor
public class JasperHoaDonService {

    private static final Logger logger = LoggerFactory.getLogger(JasperHoaDonService.class);
    private final HoaDonRepository hoaDonRepository;
    private static final DecimalFormat CURRENCY_FORMAT = new DecimalFormat("#,##0");

    /**
     * Generate HoaDon PDF using JasperReports
     *
     * @param maHoaDon HoaDon ID
     * @return PDF file as byte array
     * @throws Exception if invoice generation fails
     */
    public byte[] generateHoaDonPdf(int maHoaDon) throws Exception {
        logger.info("Generating HoaDon PDF for ID: {}", maHoaDon);

        HoaDon hoaDon = hoaDonRepository.findById(maHoaDon)
                .orElseThrow(() -> new IllegalArgumentException("HoaDon not found with ID: " + maHoaDon));

        if (hoaDon.isDaHuy()) {
            throw new IllegalStateException("Cannot generate PDF for cancelled invoice");
        }

        try {
            // Prepare parameters
            Map<String, Object> parameters = prepareHoaDonParameters(hoaDon);

            // Prepare item data for the invoice table
            List<Map<String, Object>> itemData = prepareItemData(hoaDon);
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(itemData);

            // Load JRXML template
            InputStream templateStream = new ClassPathResource("jasper/invoice_report.jrxml").getInputStream();

            // Compile report
            JasperReport jasperReport = JasperCompileManager.compileReport(templateStream);

            // Fill report
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

            // Export to PDF
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, outputStream);

            byte[] pdfBytes = outputStream.toByteArray();
            logger.info("HoaDon PDF generated successfully. Size: {} bytes", pdfBytes.length);

            return pdfBytes;

        } catch (Exception e) {
            logger.error("Error generating HoaDon PDF", e);
            throw new Exception("Error creating invoice PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Prepare item data for JasperReports table
     */
    private List<Map<String, Object>> prepareItemData(HoaDon hoaDon) {
        List<Map<String, Object>> items = new ArrayList<>();
        var donHang = hoaDon.getDonHang();
        
        if (donHang != null && !donHang.getDanhSachDatCho().isEmpty()) {
            int itemNo = 1;
            for (var datCho : donHang.getDanhSachDatCho()) {
                Map<String, Object> item = new HashMap<>();
                
                // Item number
                item.put("itemNo", itemNo++);
                
                // Description - Flight info
                StringBuilder description = new StringBuilder();
                if (datCho.getChuyenBay() != null) {
                    var flight = datCho.getChuyenBay();
                    description.append("Vé máy bay chuyến ")
                              .append(flight.getSoHieuChuyenBay() != null ? flight.getSoHieuChuyenBay() : "-");
                    if (datCho.getHangVe() != null) {
                        description.append(" - ").append(datCho.getHangVe().getTenHangVe());
                    }
                    if (datCho.getHanhKhach() != null) {
                        description.append("\nHành khách: ").append(datCho.getHanhKhach().getHoVaTen());
                    }
                } else {
                    description.append("Vé máy bay");
                }
                item.put("description", description.toString());
                
                // Quantity
                item.put("quantity", 1);
                
                // Unit price - use ticket price if available, otherwise divide total by count
                BigDecimal unitPrice = BigDecimal.ZERO;
                if (datCho.getGiaVe() != null) {
                    unitPrice = datCho.getGiaVe();
                } else if (donHang.getDanhSachDatCho().size() > 0) {
                    unitPrice = hoaDon.getTongTien().divide(
                        new BigDecimal(donHang.getDanhSachDatCho().size()), 
                        2, 
                        java.math.RoundingMode.HALF_UP
                    );
                }
                item.put("unitPrice", unitPrice.doubleValue());
                item.put("unitPriceFormatted", CURRENCY_FORMAT.format(unitPrice));
                
                // Total for this item
                item.put("totalPrice", unitPrice.doubleValue());
                item.put("totalPriceFormatted", CURRENCY_FORMAT.format(unitPrice));
                
                items.add(item);
            }
        } else {
            // If no booking details, add a single summary item
            Map<String, Object> item = new HashMap<>();
            item.put("itemNo", 1);
            item.put("description", "Dịch vụ vé máy bay");
            item.put("quantity", 1);
            
            BigDecimal unitPrice = hoaDon.getTongTien() != null ? hoaDon.getTongTien() : BigDecimal.ZERO;
            item.put("unitPrice", unitPrice.doubleValue());
            item.put("unitPriceFormatted", CURRENCY_FORMAT.format(unitPrice));
            item.put("totalPrice", unitPrice.doubleValue());
            item.put("totalPriceFormatted", CURRENCY_FORMAT.format(unitPrice));
            
            items.add(item);
        }
        
        return items;
    }

    /**
     * Prepare hoadon parameters for JasperReports
     */
    private Map<String, Object> prepareHoaDonParameters(HoaDon hoaDon) {
        Map<String, Object> parameters = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        var donHang = hoaDon.getDonHang();

        // Invoice info
        parameters.put("invoiceNumber", hoaDon.getSoHoaDon() != null ? hoaDon.getSoHoaDon() : "-");
        parameters.put("invoiceDate", hoaDon.getNgayLap() != null ? 
            hoaDon.getNgayLap().format(formatter) : LocalDate.now().format(formatter));
        parameters.put("paymentStatus", hoaDon.isDaPhatHanh() ? "ĐÃ THANH TOÁN" : "ĐÃ HỦY");
        parameters.put("paymentDate", hoaDon.getNgayLap() != null ? 
            hoaDon.getNgayLap().format(formatter) : LocalDate.now().format(formatter));

        // Customer information
        if (donHang != null && donHang.getHanhKhachNguoiDat() != null) {
            var khachHang = donHang.getHanhKhachNguoiDat();
            parameters.put("customerName", khachHang.getHoVaTen() != null ? 
                khachHang.getHoVaTen() : "-");
            parameters.put("customerEmail", donHang.getEmailNguoiDat() != null ? 
                donHang.getEmailNguoiDat() : "-");
            parameters.put("customerPhone", donHang.getSoDienThoaiNguoiDat() != null ? 
                donHang.getSoDienThoaiNguoiDat() : "-");
            parameters.put("bookingId", donHang.getPnr() != null ? donHang.getPnr() : "-");
        } else {
            parameters.put("customerName", "-");
            parameters.put("customerEmail", "-");
            parameters.put("customerPhone", "-");
            parameters.put("bookingId", "-");
        }

        // Flight information (if available)
        if (donHang != null && !donHang.getDanhSachDatCho().isEmpty()) {
            var datCho = donHang.getDanhSachDatCho().iterator().next();
            if (datCho.getChuyenBay() != null) {
                var flight = datCho.getChuyenBay();
                var route = flight.getTuyenBay();

                parameters.put("flightNumber", flight.getSoHieuChuyenBay() != null ? 
                    flight.getSoHieuChuyenBay() : "-");
                
                String routeInfo = "-";
                if (route != null) {
                    String departure = route.getSanBayDi() != null ? String.valueOf(route.getSanBayDi().getMaSanBay()) : "-";
                    String arrival = route.getSanBayDen() != null ? String.valueOf(route.getSanBayDen().getMaSanBay()) : "-";
                    routeInfo = departure + " → " + arrival;
                }
                parameters.put("route", routeInfo);

                parameters.put("departureDate", flight.getNgayDi() != null ? 
                    flight.getNgayDi().toString() : "-");
                parameters.put("departureTime", flight.getGioDi() != null ? 
                    flight.getGioDi().toString() : "-");
                parameters.put("ticketClass", datCho.getHangVe() != null ? 
                    datCho.getHangVe().getTenHangVe() : "-");
            } else {
                setEmptyFlightInfo(parameters);
            }
        } else {
            setEmptyFlightInfo(parameters);
        }

        // Financial information from HoaDon
        BigDecimal subtotal = hoaDon.getTongTien() != null ? hoaDon.getTongTien() : BigDecimal.ZERO;
        BigDecimal tax = hoaDon.getThueVAT() != null ? hoaDon.getThueVAT() : BigDecimal.ZERO;
        BigDecimal total = hoaDon.getTongThanhToan() != null ? hoaDon.getTongThanhToan() : subtotal.add(tax);

        parameters.put("subtotal", subtotal.doubleValue());
        parameters.put("subtotalFormatted", CURRENCY_FORMAT.format(subtotal));
        parameters.put("tax", tax.doubleValue());
        parameters.put("taxFormatted", CURRENCY_FORMAT.format(tax));
        parameters.put("total", total.doubleValue());
        parameters.put("totalFormatted", CURRENCY_FORMAT.format(total));
        
        // VAT rate (default 10%)
        double vatRate = subtotal.compareTo(BigDecimal.ZERO) > 0 
            ? tax.multiply(new BigDecimal(100)).divide(subtotal, 0, java.math.RoundingMode.HALF_UP).doubleValue() 
            : 10.0;
        parameters.put("vatRate", vatRate);
        parameters.put("vatRateFormatted", String.format("%.0f%%", vatRate));

        return parameters;
    }
    
    private void setEmptyFlightInfo(Map<String, Object> parameters) {
        parameters.put("flightNumber", "-");
        parameters.put("route", "-");
        parameters.put("departureDate", "-");
        parameters.put("departureTime", "-");
        parameters.put("ticketClass", "-");
    }
}
