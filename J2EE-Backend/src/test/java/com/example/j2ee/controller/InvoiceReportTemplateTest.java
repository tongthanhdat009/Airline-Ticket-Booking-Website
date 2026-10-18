package com.example.j2ee.controller;

import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRMapCollectionDataSource;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Fix D-11: template invoice_report.jrxml phải fill được với dữ liệu
 * đúng shape mà ClientInvoiceController đưa vào (keys + kiểu).
 * Test này tái hiện chính xác lỗi cũ (JRExpressionEvalException $F{quantity}):
 * nếu controller/jrxml lệch nhau, fillReport sẽ nổ exception.
 */
class InvoiceReportTemplateTest {

    @Test
    void invoiceTemplateFillsWithControllerShapedData() throws Exception {
        InputStream reportStream =
                new ClassPathResource("jasper/invoice_report.jrxml").getInputStream();
        JasperReport jasperReport = JasperCompileManager.compileReport(reportStream);

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("invoiceNumber", "INV-000034");
        parameters.put("invoiceDate", "17/10/2026");
        parameters.put("customerName", "Nguyen Van A");
        parameters.put("customerEmail", "a@x.com");
        parameters.put("customerPhone", "0912345678");
        parameters.put("bookingId", "BK-000005");
        parameters.put("flightNumber", "VN418");
        parameters.put("route", "TP. Ho Chi Minh → Ha Noi");
        parameters.put("departureDate", "18/10/2026");
        parameters.put("departureTime", "08:30");
        parameters.put("ticketClass", "Economy");
        parameters.put("subtotal", 1439090.91);
        parameters.put("tax", 143909.09);
        parameters.put("total", 1583000.0);
        parameters.put("paymentStatus", "PAID");
        parameters.put("paymentDate", "17/10/2026");

        // Shape y hệt controller sau fix D-11.
        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> ticket = new HashMap<>();
        ticket.put("itemNo", 1);
        ticket.put("description", "Flight Ticket - Seat 30");
        ticket.put("quantity", 1);
        ticket.put("unitPrice", 1400000.0);
        ticket.put("totalPrice", 1400000.0);
        ticket.put("unitPriceFormatted", "1,400,000 VND");
        ticket.put("totalPriceFormatted", "1,400,000 VND");
        items.add(ticket);
        Map<String, Object> service = new HashMap<>();
        service.put("itemNo", 2);
        service.put("description", "Extra Baggage - 10kg");
        service.put("quantity", 2);
        service.put("unitPrice", 91500.0);
        service.put("totalPrice", 183000.0);
        service.put("unitPriceFormatted", "91,500 VND");
        service.put("totalPriceFormatted", "183,000 VND");
        items.add(service);

        Collection<Map<String, ?>> mapItems = new ArrayList<>(items);
        JasperPrint print = JasperFillManager.fillReport(
                jasperReport, parameters, new JRMapCollectionDataSource(mapItems));
        byte[] pdf = JasperExportManager.exportReportToPdf(print);

        assertNotNull(pdf);
        assertTrue(pdf.length > 1000, "PDF hóa đơn phải có nội dung");
        assertFalse(print.getPages().isEmpty(), "Báo cáo phải có ít nhất 1 trang");
    }
}
