package com.example.j2ee.service;

import com.example.j2ee.model.ChiTietChuyenBay;
import com.example.j2ee.model.ChiTietGhe;
import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.TrangThaiThanhToan;
import com.example.j2ee.repository.DatChoRepository;
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
 * Service for generating flight ticket PDFs using JasperReports
 */
@Service
@RequiredArgsConstructor
public class JasperTicketService {

    private static final Logger logger = LoggerFactory.getLogger(JasperTicketService.class);
    private final TrangThaiThanhToanRepository thanhToanRepository;
    private final DatChoRepository datChoRepository;

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
            // Prepare parameters for invoice
            Map<String, Object> parameters = prepareInvoiceParameters(payment);

            // Prepare data source for invoice items
            List<Map<String, Object>> invoiceItems = new ArrayList<>();
            Map<String, Object> flightItem = new HashMap<>();
            flightItem.put("rowNumber", 1);
            flightItem.put("description", "Flight Ticket");
            flightItem.put("quantity", "1");
            flightItem.put("unitPrice", payment.getSoTien());
            flightItem.put("amount", payment.getSoTien());
            invoiceItems.add(flightItem);
            
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(invoiceItems);

            // Load JRXML template - invoice_report.jrxml
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
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        
        DatCho booking = payment.getDatCho();
        ChiTietGhe chiTietGhe = booking != null ? booking.getChiTietGhe() : null;
        ChiTietChuyenBay flight = booking != null ? booking.getChuyenBay() : null;

        // Invoice information
        parameters.put("invoiceNumber", String.format("INV-%06d", payment.getMaThanhToan()));
        parameters.put("invoiceDate", LocalDate.now().format(dateFormatter));
        
        // Customer information
        if (booking != null && booking.getHanhKhach() != null) {
            parameters.put("customerName", booking.getHanhKhach().getHoVaTen() != null ? 
                booking.getHanhKhach().getHoVaTen().toUpperCase() : "-");
            parameters.put("customerEmail", booking.getHanhKhach().getEmail() != null ? 
                booking.getHanhKhach().getEmail() : "-");
            parameters.put("customerPhone", booking.getHanhKhach().getSoDienThoai() != null ? 
                booking.getHanhKhach().getSoDienThoai() : "-");
        } else {
            parameters.put("customerName", "-");
            parameters.put("customerEmail", "-");
            parameters.put("customerPhone", "-");
        }
        
        parameters.put("bookingId", booking != null ? String.valueOf(booking.getMaDatCho()) : "-");

        // Flight information
        if (flight != null) {
            parameters.put("flightNumber", flight.getSoHieuChuyenBay() != null ? 
                flight.getSoHieuChuyenBay() : "-");
            parameters.put("departureDate", flight.getNgayDi() != null ? 
                flight.getNgayDi().format(dateFormatter) : "-");
            parameters.put("departureTime", flight.getGioDi() != null ? 
                flight.getGioDi().format(timeFormatter) : "-");
            
            // Route information
            if (flight.getTuyenBay() != null) {
                String departureCity = flight.getTuyenBay().getSanBayDi() != null ? 
                    flight.getTuyenBay().getSanBayDi().getThanhPhoSanBay() : "-";
                String arrivalCity = flight.getTuyenBay().getSanBayDen() != null ? 
                    flight.getTuyenBay().getSanBayDen().getThanhPhoSanBay() : "-";
                parameters.put("route", departureCity + " → " + arrivalCity);
            } else {
                parameters.put("route", "-");
            }
        } else {
            parameters.put("flightNumber", "-");
            parameters.put("departureDate", "-");
            parameters.put("departureTime", "-");
            parameters.put("route", "-");
        }

        // Ticket class - lấy từ DatCho.getHangVe()
        if (booking != null && booking.getHangVe() != null) {
            parameters.put("ticketClass", booking.getHangVe().getTenHangVe() != null ? 
                booking.getHangVe().getTenHangVe() : "-");
        } else {
            parameters.put("ticketClass", "-");
        }

        // Financial information
        BigDecimal totalAmount = payment.getSoTien() != null ? payment.getSoTien() : BigDecimal.ZERO;
        BigDecimal tax = BigDecimal.ZERO; // No tax for now
        BigDecimal subtotal = totalAmount.subtract(tax);
        
        parameters.put("subtotal", subtotal);
        parameters.put("tax", tax);
        parameters.put("total", totalAmount);
        
        // Payment status
        parameters.put("paymentStatus", payment.getDaThanhToan() == 'Y' ? "PAID" : "UNPAID");
        parameters.put("paymentDate", LocalDate.now().format(dateFormatter));

        return parameters;
    }

    /**
     * Generate ticket PDF using JasperReports
     *
     * @param maThanhToan Payment ID
     * @return PDF file as byte array
     * @throws Exception if ticket generation fails
     */
    public byte[] generateTicketPdf(int maThanhToan) throws Exception {
        logger.info("Generating ticket PDF with JasperReports for payment ID: {}", maThanhToan);

        TrangThaiThanhToan payment = thanhToanRepository.findById(maThanhToan)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found with ID: " + maThanhToan));

        if (payment.getDaThanhToan() != 'Y') {
            throw new IllegalStateException("Cannot generate ticket for unpaid payment");
        }

        try {
            // Prepare parameters
            Map<String, Object> parameters = prepareTicketParameters(payment);

            // Prepare dummy data source (we only need one row for flight info)
            List<Map<String, Object>> dummyData = new ArrayList<>();
            Map<String, Object> flightData = new HashMap<>();
            flightData.put("description", "");
            flightData.put("quantity", "1");
            flightData.put("unitPrice", payment.getSoTien());
            flightData.put("amount", payment.getSoTien());
            dummyData.add(flightData);
            
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(dummyData);

            // Load JRXML template
            InputStream templateStream = new ClassPathResource("jasper/ticket_report.jrxml").getInputStream();

            // Compile report
            JasperReport jasperReport = JasperCompileManager.compileReport(templateStream);

            // Fill report
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

            // Export to PDF
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, outputStream);

            byte[] pdfBytes = outputStream.toByteArray();
            logger.info("Ticket PDF generated successfully with JasperReports. Size: {} bytes", pdfBytes.length);

            return pdfBytes;

        } catch (Exception e) {
            logger.error("Error generating ticket PDF with JasperReports", e);
            throw new Exception("Error creating ticket: " + e.getMessage(), e);
        }
    }

    /**
     * Generate ticket PDF directly from booking ID (for multiple passenger bookings)
     * This method creates a mock payment object with the booking to generate the PDF
     */
    public byte[] generateTicketPdfByBooking(int maDatCho) throws Exception {
        logger.info("Generating ticket PDF for booking ID: {}", maDatCho);

        DatCho booking = datChoRepository.findById(maDatCho)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + maDatCho));

        // Find the actual payment for this booking or create a mock one
        TrangThaiThanhToan mockPayment = new TrangThaiThanhToan();
        mockPayment.setDatCho(booking);
        mockPayment.setDaThanhToan('Y');
        
        // Calculate payment amount (you may need to adjust this based on your business logic)
        // For now, use a default or calculate from flight price
        BigDecimal amount = BigDecimal.ZERO;
        if (booking.getChuyenBay() != null) {
            var flight = booking.getChuyenBay();
            // Assuming there's a price field in flight or you can calculate it
            amount = new BigDecimal("1000000"); // Default value, adjust as needed
        }
        mockPayment.setSoTien(amount);

        try {
            // Prepare parameters
            Map<String, Object> parameters = prepareTicketParameters(mockPayment);

            // Prepare dummy data source
            List<Map<String, Object>> dummyData = new ArrayList<>();
            Map<String, Object> flightData = new HashMap<>();
            flightData.put("description", "");
            flightData.put("quantity", "1");
            flightData.put("unitPrice", amount);
            flightData.put("amount", amount);
            dummyData.add(flightData);
            
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(dummyData);

            // Load JRXML template
            InputStream templateStream = new ClassPathResource("jasper/ticket_report.jrxml").getInputStream();

            // Compile report
            JasperReport jasperReport = JasperCompileManager.compileReport(templateStream);

            // Fill report
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

            // Export to PDF
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, outputStream);

            byte[] pdfBytes = outputStream.toByteArray();
            logger.info("Ticket PDF generated successfully for booking {}. Size: {} bytes", maDatCho, pdfBytes.length);

            return pdfBytes;

        } catch (Exception e) {
            logger.error("Error generating ticket PDF for booking " + maDatCho, e);
            throw new Exception("Error creating ticket: " + e.getMessage(), e);
        }
    }

    /**
     * Prepare ticket parameters for JasperReports
     */
    private Map<String, Object> prepareTicketParameters(TrangThaiThanhToan payment) {
        Map<String, Object> parameters = new HashMap<>();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        
        DatCho booking = payment.getDatCho();
        ChiTietGhe chiTietGhe = booking != null ? booking.getChiTietGhe() : null;
        ChiTietChuyenBay flight = booking != null ? booking.getChuyenBay() : null;

        // Booking code
        String bookingCode = String.format("%d", booking != null ? booking.getMaDatCho() : 0);
        parameters.put("bookingCode", bookingCode);
        
        // Issue date and booking date
        parameters.put("issueDate", LocalDate.now().format(dateFormatter));
        parameters.put("bookingDate", booking != null && booking.getNgayDatCho() != null ? 
            new java.text.SimpleDateFormat("dd/MM/yyyy").format(booking.getNgayDatCho()) : "-");

        // Passenger information
        if (booking != null && booking.getHanhKhach() != null) {
            String passengerName = booking.getHanhKhach().getHoVaTen();
            if (passengerName != null) {
                passengerName = passengerName.toUpperCase();
            } else {
                passengerName = "-";
            }
            parameters.put("passengerName", passengerName);
            parameters.put("passengerCount", "1");
        } else {
            parameters.put("passengerName", "-");
            parameters.put("passengerCount", "1");
        }

        // Flight information
        if (flight != null) {
            parameters.put("flightNumber", flight.getSoHieuChuyenBay() != null ? 
                flight.getSoHieuChuyenBay() : "-");
            parameters.put("departureDate", flight.getNgayDi() != null ? 
                flight.getNgayDi().format(dateFormatter) : "-");
            parameters.put("departureTime", flight.getGioDi() != null ? 
                flight.getGioDi().format(timeFormatter) : "-");
            parameters.put("arrivalTime", flight.getGioDen() != null ? 
                flight.getGioDen().format(timeFormatter) : "-");
            
            // Route information
            if (flight.getTuyenBay() != null) {
                if (flight.getTuyenBay().getSanBayDi() != null) {
                    parameters.put("departureCity", flight.getTuyenBay().getSanBayDi().getThanhPhoSanBay() != null ? 
                        flight.getTuyenBay().getSanBayDi().getThanhPhoSanBay() : "-");
                    // Show full airport name instead of just IATA code
                    String depAirport = flight.getTuyenBay().getSanBayDi().getTenSanBay() != null ?
                        flight.getTuyenBay().getSanBayDi().getTenSanBay() : 
                        (flight.getTuyenBay().getSanBayDi().getMaIATA() != null ? 
                            flight.getTuyenBay().getSanBayDi().getMaIATA() : "-");
                    parameters.put("departureAirport", depAirport);
                } else {
                    parameters.put("departureCity", "-");
                    parameters.put("departureAirport", "-");
                }
                
                if (flight.getTuyenBay().getSanBayDen() != null) {
                    parameters.put("arrivalCity", flight.getTuyenBay().getSanBayDen().getThanhPhoSanBay() != null ? 
                        flight.getTuyenBay().getSanBayDen().getThanhPhoSanBay() : "-");
                    // Show full airport name instead of just IATA code
                    String arrAirport = flight.getTuyenBay().getSanBayDen().getTenSanBay() != null ?
                        flight.getTuyenBay().getSanBayDen().getTenSanBay() : 
                        (flight.getTuyenBay().getSanBayDen().getMaIATA() != null ? 
                            flight.getTuyenBay().getSanBayDen().getMaIATA() : "-");
                    parameters.put("arrivalAirport", arrAirport);
                } else {
                    parameters.put("arrivalCity", "-");
                    parameters.put("arrivalAirport", "-");
                }
            } else {
                parameters.put("departureCity", "-");
                parameters.put("departureAirport", "-");
                parameters.put("arrivalCity", "-");
                parameters.put("arrivalAirport", "-");
            }
        } else {
            parameters.put("flightNumber", "-");
            parameters.put("departureDate", "-");
            parameters.put("departureTime", "-");
            parameters.put("arrivalTime", "-");
            parameters.put("departureCity", "-");
            parameters.put("departureAirport", "-");
            parameters.put("arrivalCity", "-");
            parameters.put("arrivalAirport", "-");
        }

        // Ticket class and seat
        // Lấy hạng vé từ DatCho
        if (booking != null && booking.getHangVe() != null) {
            parameters.put("ticketClass", booking.getHangVe().getTenHangVe() != null ? 
                booking.getHangVe().getTenHangVe() : "-");
        } else {
            parameters.put("ticketClass", "-");
        }
        
        // Lấy thông tin ghế nếu có
        if (chiTietGhe != null) {
            parameters.put("seatNumber", chiTietGhe.getSoGhe() != null ? 
                chiTietGhe.getSoGhe() : String.valueOf(chiTietGhe.getMaGhe()));
        } else {
            parameters.put("seatNumber", "-");
        }

        // Travel type
        parameters.put("travelType", "Promo");

        // Financial information
        BigDecimal totalAmount = payment.getSoTien() != null ? payment.getSoTien() : BigDecimal.ZERO;
        parameters.put("totalAmount", totalAmount);

        return parameters;
    }

    /**
     * Generate ticket in different formats
     *
     * @param maThanhToan Payment ID
     * @param format      Export format (pdf, html)
     * @return Report as byte array
     * @throws Exception if generation fails
     */
    public byte[] generateTicketWithFormat(int maThanhToan, String format) throws Exception {
        logger.info("Generating ticket in {} format for payment ID: {}", format, maThanhToan);

        TrangThaiThanhToan payment = thanhToanRepository.findById(maThanhToan)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found with ID: " + maThanhToan));

        if (payment.getDaThanhToan() != 'Y') {
            throw new IllegalStateException("Cannot generate ticket for unpaid payment");
        }

        try {
            // Prepare parameters and data
            Map<String, Object> parameters = prepareTicketParameters(payment);
            List<Map<String, Object>> dummyData = new ArrayList<>();
            Map<String, Object> flightData = new HashMap<>();
            flightData.put("description", "");
            flightData.put("quantity", "1");
            flightData.put("unitPrice", payment.getSoTien());
            flightData.put("amount", payment.getSoTien());
            dummyData.add(flightData);
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(dummyData);

            // Load and compile template
            InputStream templateStream = new ClassPathResource("jasper/ticket_report.jrxml").getInputStream();
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

            logger.info("Ticket generated in {} format. Size: {} bytes", format, outputStream.size());
            return outputStream.toByteArray();

        } catch (Exception e) {
            logger.error("Error generating ticket in {} format", format, e);
            throw new Exception("Error creating ticket: " + e.getMessage(), e);
        }
    }
}
