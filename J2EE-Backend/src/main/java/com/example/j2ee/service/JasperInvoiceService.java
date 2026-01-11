package com.example.j2ee.service;

import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.DatChoDichVu;
import com.example.j2ee.model.TrangThaiThanhToan;
import com.example.j2ee.repository.TrangThaiThanhToanRepository;
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
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Service for generating invoice PDFs using JasperReports
 * This replaces the iText-based InvoicePdfService
 */
@Service
@RequiredArgsConstructor
public class JasperInvoiceService {

    private static final Logger logger = LoggerFactory.getLogger(JasperInvoiceService.class);
    private final TrangThaiThanhToanRepository thanhToanRepository;

    /**
     * Generate invoice PDF using JasperReports
     *
     * @param maThanhToan Payment ID
     * @return PDF file as byte array
     * @throws Exception if invoice generation fails
     */
    public byte[] generateInvoicePdf(int maThanhToan) throws Exception {
        logger.info("Generating invoice PDF with JasperReports for payment ID: {}", maThanhToan);

        TrangThaiThanhToan payment = thanhToanRepository.findById(maThanhToan)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found with ID: " + maThanhToan));

        if (payment.getDaThanhToan() != 'Y') {
            throw new IllegalStateException("Cannot generate invoice for unpaid payment");
        }

        try {
            // Prepare parameters
            Map<String, Object> parameters = prepareInvoiceParameters(payment);

            // Prepare data source for services
            List<Map<String, Object>> servicesData = prepareServicesData(payment);
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(servicesData);

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
            logger.info("Invoice PDF generated successfully with JasperReports. Size: {} bytes", pdfBytes.length);

            return pdfBytes;

        } catch (Exception e) {
            logger.error("Error generating invoice PDF with JasperReports", e);
            throw new Exception("Error creating invoice: " + e.getMessage(), e);
        }
    }

    /**
     * Prepare invoice parameters for JasperReports
     */
    private Map<String, Object> prepareInvoiceParameters(TrangThaiThanhToan payment) {
        Map<String, Object> parameters = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DatCho booking = payment.getDatCho();

        // Invoice info
        parameters.put("invoiceNumber", "INV-" + String.format("%06d", payment.getMaThanhToan()));
        parameters.put("invoiceDate", LocalDate.now().format(formatter));
        parameters.put("paymentStatus", "PAID");
        parameters.put("paymentDate", LocalDate.now().format(formatter));

        // Customer information
        if (booking != null && booking.getHanhKhach() != null) {
            parameters.put("customerName", booking.getHanhKhach().getHoVaTen() != null ? 
                booking.getHanhKhach().getHoVaTen() : "-");
            parameters.put("customerEmail", booking.getHanhKhach().getEmail() != null ? 
                booking.getHanhKhach().getEmail() : "-");
            parameters.put("customerPhone", booking.getHanhKhach().getSoDienThoai() != null ? 
                booking.getHanhKhach().getSoDienThoai() : "-");
            parameters.put("bookingId", "#" + booking.getMaDatCho());
        } else {
            parameters.put("customerName", "-");
            parameters.put("customerEmail", "-");
            parameters.put("customerPhone", "-");
            parameters.put("bookingId", "-");
        }

        // Flight information
        if (booking != null && booking.getChuyenBay() != null) {
            
            var flight = booking.getChuyenBay();
            var route = flight.getTuyenBay();

            parameters.put("flightNumber", flight.getSoHieuChuyenBay() != null ? 
                flight.getSoHieuChuyenBay() : "-");
            
            String routeInfo = "-";
            if (route != null) {
                String departure = route.getSanBayDi() != null ? route.getSanBayDi().getTenSanBay() : "-";
                String arrival = route.getSanBayDen() != null ? route.getSanBayDen().getTenSanBay() : "-";
                routeInfo = departure + " → " + arrival;
            }
            parameters.put("route", routeInfo);

            parameters.put("departureDate", flight.getNgayDi() != null ? 
                flight.getNgayDi().toString() : "-");
            parameters.put("departureTime", flight.getGioDi() != null ? 
                flight.getGioDi().toString() : "-");
            
            parameters.put("ticketClass", booking.getHangVe() != null ? 
                booking.getHangVe().getTenHangVe() : "-");
        } else {
            parameters.put("flightNumber", "-");
            parameters.put("route", "-");
            parameters.put("departureDate", "-");
            parameters.put("departureTime", "-");
            parameters.put("ticketClass", "-");
        }

        // Financial information
        BigDecimal subtotal = payment.getSoTien() != null ? payment.getSoTien() : BigDecimal.ZERO;
        BigDecimal tax = BigDecimal.ZERO;
        BigDecimal total = subtotal.add(tax);

        parameters.put("subtotal", subtotal);
        parameters.put("tax", tax);
        parameters.put("total", total);

        return parameters;
    }

    /**
     * Prepare services data for the invoice detail table
     */
    private List<Map<String, Object>> prepareServicesData(TrangThaiThanhToan payment) {
        List<Map<String, Object>> servicesData = new ArrayList<>();
        DatCho booking = payment.getDatCho();
        int rowNumber = 1;

        // Calculate ticket price
        BigDecimal ticketPrice = payment.getSoTien();
        Set<DatChoDichVu> services = booking != null ? booking.getDanhSachDichVu() : null;

        if (services != null && !services.isEmpty()) {
            BigDecimal servicesTotal = services.stream()
                    .map(s -> s.getDonGia().multiply(BigDecimal.valueOf(s.getSoLuong())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            ticketPrice = payment.getSoTien().subtract(servicesTotal);
        }

        // Add ticket item
        Map<String, Object> ticketItem = new HashMap<>();
        ticketItem.put("rowNumber", rowNumber++);
        ticketItem.put("description", "Flight Ticket");
        ticketItem.put("quantity", "1");
        ticketItem.put("unitPrice", ticketPrice);
        ticketItem.put("amount", ticketPrice);
        servicesData.add(ticketItem);

        // Add additional services
        if (services != null && !services.isEmpty()) {
            for (DatChoDichVu service : services) {
                Map<String, Object> serviceItem = new HashMap<>();
                
                String serviceName = "Additional Service";
                if (service.getLuaChonDichVu() != null && 
                    service.getLuaChonDichVu().getDichVuCungCap() != null) {
                    serviceName = service.getLuaChonDichVu().getDichVuCungCap().getTenDichVu() + 
                                 " - " + service.getLuaChonDichVu().getTenLuaChon();
                }

                BigDecimal amount = service.getDonGia().multiply(BigDecimal.valueOf(service.getSoLuong()));

                serviceItem.put("rowNumber", rowNumber++);
                serviceItem.put("description", serviceName);
                serviceItem.put("quantity", String.valueOf(service.getSoLuong()));
                serviceItem.put("unitPrice", service.getDonGia());
                serviceItem.put("amount", amount);
                servicesData.add(serviceItem);
            }
        }

        return servicesData;
    }

    /**
     * Generate invoice in different formats
     *
     * @param maThanhToan Payment ID
     * @param format      Export format (pdf, html)
     * @return Report as byte array
     * @throws Exception if generation fails
     */
    public byte[] generateInvoiceWithFormat(int maThanhToan, String format) throws Exception {
        logger.info("Generating invoice in {} format for payment ID: {}", format, maThanhToan);

        TrangThaiThanhToan payment = thanhToanRepository.findById(maThanhToan)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found with ID: " + maThanhToan));

        if (payment.getDaThanhToan() != 'Y') {
            throw new IllegalStateException("Cannot generate invoice for unpaid payment");
        }

        try {
            // Prepare parameters and data
            Map<String, Object> parameters = prepareInvoiceParameters(payment);
            List<Map<String, Object>> servicesData = prepareServicesData(payment);
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(servicesData);

            // Load and compile template
            InputStream templateStream = new ClassPathResource("jasper/invoice_report.jrxml").getInputStream();
            JasperReport jasperReport = JasperCompileManager.compileReport(templateStream);
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

            // Export based on format
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            switch (format.toLowerCase()) {
                case "pdf":
                    JasperExportManager.exportReportToPdfStream(jasperPrint, outputStream);
                    break;
                case "html":
                    JasperExportManager.exportReportToHtmlFile(jasperPrint, outputStream.toString());
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported format: " + format);
            }

            logger.info("Invoice generated in {} format. Size: {} bytes", format, outputStream.size());
            return outputStream.toByteArray();

        } catch (Exception e) {
            logger.error("Error generating invoice in {} format", format, e);
            throw new Exception("Error creating invoice: " + e.getMessage(), e);
        }
    }
}
