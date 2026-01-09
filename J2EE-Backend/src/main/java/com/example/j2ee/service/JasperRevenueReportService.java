package com.example.j2ee.service;

import com.example.j2ee.dto.ThongKeDoanhThuNgayDTO;
import com.example.j2ee.dto.ThongKeTongQuanDTO;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for generating revenue reports using JasperReports
 * This replaces the iText-based PdfReportService
 */
@Service
@RequiredArgsConstructor
public class JasperRevenueReportService {

    private static final Logger logger = LoggerFactory.getLogger(JasperRevenueReportService.class);
    private final ThongKeService thongKeService;

    /**
     * Generate revenue report PDF using JasperReports
     *
     * @param startDate Start date of the report period
     * @param endDate   End date of the report period
     * @return PDF file as byte array
     * @throws Exception if report generation fails
     */
    public byte[] generateRevenueReport(LocalDate startDate, LocalDate endDate) throws Exception {
        logger.info("Generating revenue report with JasperReports from {} to {}", startDate, endDate);

        try {
            // Fetch data
            ThongKeTongQuanDTO overview = thongKeService.getThongKeTongQuan(startDate, endDate);
            List<ThongKeDoanhThuNgayDTO> dailyRevenue = thongKeService.getDoanhThuTheoNgay(startDate, endDate);

            logger.info("Data fetched - Overview: {}, Daily records: {}",
                    overview != null, dailyRevenue != null ? dailyRevenue.size() : 0);

            // Prepare parameters
            Map<String, Object> parameters = new HashMap<>();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

            parameters.put("startDate", startDate.format(formatter));
            parameters.put("endDate", endDate.format(formatter));
            parameters.put("reportDate", LocalDate.now().format(formatter));

            // Add summary data
            if (overview != null) {
                parameters.put("totalRevenue", overview.getTongDoanhThu() != null ? overview.getTongDoanhThu() : BigDecimal.ZERO);
                parameters.put("ticketRevenue", overview.getDoanhThuBanVe() != null ? overview.getDoanhThuBanVe() : BigDecimal.ZERO);
                parameters.put("serviceRevenue", overview.getDoanhThuDichVu() != null ? overview.getDoanhThuDichVu() : BigDecimal.ZERO);
                parameters.put("newCustomers", overview.getKhachHangMoi() != null ? overview.getKhachHangMoi() : 0L);
            } else {
                parameters.put("totalRevenue", BigDecimal.ZERO);
                parameters.put("ticketRevenue", BigDecimal.ZERO);
                parameters.put("serviceRevenue", BigDecimal.ZERO);
                parameters.put("newCustomers", 0L);
            }

            // Prepare data source for daily revenue
            List<Map<String, Object>> dataList = dailyRevenue.stream()
                    .map(item -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("ngay", item.getNgay().format(formatter));
                        map.put("doanhThu", item.getDoanhThu());
                        return map;
                    })
                    .collect(Collectors.toList());

            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(dataList);

            // Load JRXML template
            InputStream templateStream = new ClassPathResource("jasper/revenue_report.jrxml").getInputStream();
            
            // Compile report
            JasperReport jasperReport = JasperCompileManager.compileReport(templateStream);

            // Fill report
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

            // Export to PDF
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, outputStream);

            byte[] pdfBytes = outputStream.toByteArray();
            logger.info("Revenue report generated successfully with JasperReports. Size: {} bytes", pdfBytes.length);

            return pdfBytes;

        } catch (Exception e) {
            logger.error("Error generating revenue report with JasperReports", e);
            throw new Exception("Error creating revenue report: " + e.getMessage(), e);
        }
    }

    /**
     * Generate revenue report and export to different formats
     *
     * @param startDate Start date
     * @param endDate   End date
     * @param format    Export format (pdf, xlsx, html)
     * @return Report as byte array
     * @throws Exception if generation fails
     */
    public byte[] generateRevenueReportWithFormat(LocalDate startDate, LocalDate endDate, String format) throws Exception {
        logger.info("Generating revenue report in {} format", format);

        try {
            // Fetch data
            ThongKeTongQuanDTO overview = thongKeService.getThongKeTongQuan(startDate, endDate);
            List<ThongKeDoanhThuNgayDTO> dailyRevenue = thongKeService.getDoanhThuTheoNgay(startDate, endDate);

            // Prepare parameters
            Map<String, Object> parameters = new HashMap<>();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

            parameters.put("startDate", startDate.format(formatter));
            parameters.put("endDate", endDate.format(formatter));
            parameters.put("reportDate", LocalDate.now().format(formatter));

            if (overview != null) {
                parameters.put("totalRevenue", overview.getTongDoanhThu() != null ? overview.getTongDoanhThu() : BigDecimal.ZERO);
                parameters.put("ticketRevenue", overview.getDoanhThuBanVe() != null ? overview.getDoanhThuBanVe() : BigDecimal.ZERO);
                parameters.put("serviceRevenue", overview.getDoanhThuDichVu() != null ? overview.getDoanhThuDichVu() : BigDecimal.ZERO);
                parameters.put("newCustomers", overview.getKhachHangMoi() != null ? overview.getKhachHangMoi() : 0L);
            } else {
                parameters.put("totalRevenue", BigDecimal.ZERO);
                parameters.put("ticketRevenue", BigDecimal.ZERO);
                parameters.put("serviceRevenue", BigDecimal.ZERO);
                parameters.put("newCustomers", 0L);
            }

            // Prepare data source
            List<Map<String, Object>> dataList = dailyRevenue.stream()
                    .map(item -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("ngay", item.getNgay().format(formatter));
                        map.put("doanhThu", item.getDoanhThu());
                        return map;
                    })
                    .collect(Collectors.toList());

            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(dataList);

            // Load and compile template
            InputStream templateStream = new ClassPathResource("jasper/revenue_report.jrxml").getInputStream();
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

            logger.info("Report generated in {} format. Size: {} bytes", format, outputStream.size());
            return outputStream.toByteArray();

        } catch (Exception e) {
            logger.error("Error generating report in {} format", format, e);
            throw new Exception("Error creating report: " + e.getMessage(), e);
        }
    }
}
