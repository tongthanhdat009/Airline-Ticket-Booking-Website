package com.example.j2ee.service;

import com.example.j2ee.dto.hoadon.HoaDonResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service for exporting data to Excel format
 */
@Slf4j
@Service
public class ExcelExportService {

    /**
     * Export list of HoaDon to Excel
     *
     * @param hoaDonList List of HoaDonResponse
     * @return Excel file as byte array
     * @throws Exception if export fails
     */
    public byte[] exportHoaDonToExcel(List<HoaDonResponse> hoaDonList) throws Exception {
        log.info("Exporting {} hoadon to Excel", hoaDonList.size());
        
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            
            // Create sheet
            Sheet sheet = workbook.createSheet("Danh Sach Hoa Don");
            
            // Create header style
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "STT", "So Hoa Don", "Ma Don Hang", "PNR", 
                "Ngay Lap", "Ngay Hach Toan", "Ho Ten KH", "Email",
                "Tong Tien", "Thue VAT", "Tong Thanh Toan", "Trang Thai", "Nguoi Lap"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Create data rows
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
            int rowNum = 1;
            
            for (HoaDonResponse hoaDon : hoaDonList) {
                Row row = sheet.createRow(rowNum++);
                
                // STT
                row.createCell(0).setCellValue(rowNum - 1);
                row.getCell(0).setCellStyle(dataStyle);
                
                // So Hoa Don
                row.createCell(1).setCellValue(hoaDon.getSoHoaDon() != null ? hoaDon.getSoHoaDon() : "");
                row.getCell(1).setCellStyle(dataStyle);
                
                // Ma Don Hang
                row.createCell(2).setCellValue(hoaDon.getMaDonHang() != null ? hoaDon.getMaDonHang() : 0);
                row.getCell(2).setCellStyle(dataStyle);
                
                // PNR
                row.createCell(3).setCellValue(hoaDon.getPnr() != null ? hoaDon.getPnr() : "");
                row.getCell(3).setCellStyle(dataStyle);
                
                // Ngay Lap
                row.createCell(4).setCellValue(hoaDon.getNgayLap() != null ? 
                    hoaDon.getNgayLap().format(dateFormatter) : "");
                row.getCell(4).setCellStyle(dateStyle);
                
                // Ngay Hach Toan
                row.createCell(5).setCellValue(hoaDon.getNgayHachToan() != null ? 
                    hoaDon.getNgayHachToan().toString() : "");
                row.getCell(5).setCellStyle(dateStyle);
                
                // Ho Ten KH
                row.createCell(6).setCellValue(hoaDon.getHoTenNguoiDat() != null ? hoaDon.getHoTenNguoiDat() : "");
                row.getCell(6).setCellStyle(dataStyle);
                
                // Email
                row.createCell(7).setCellValue(hoaDon.getEmailNguoiDat() != null ? hoaDon.getEmailNguoiDat() : "");
                row.getCell(7).setCellStyle(dataStyle);
                
                // Tong Tien
                row.createCell(8).setCellValue(hoaDon.getTongTien() != null ? 
                    hoaDon.getTongTien().doubleValue() : 0);
                row.getCell(8).setCellStyle(currencyStyle);
                
                // Thue VAT
                row.createCell(9).setCellValue(hoaDon.getThueVAT() != null ? 
                    hoaDon.getThueVAT().doubleValue() : 0);
                row.getCell(9).setCellStyle(currencyStyle);
                
                // Tong Thanh Toan
                row.createCell(10).setCellValue(hoaDon.getTongThanhToan() != null ? 
                    hoaDon.getTongThanhToan().doubleValue() : 0);
                row.getCell(10).setCellStyle(currencyStyle);
                
                // Trang Thai
                row.createCell(11).setCellValue(getTrangThaiText(hoaDon.getTrangThai()));
                row.getCell(11).setCellStyle(dataStyle);
                
                // Nguoi Lap
                row.createCell(12).setCellValue(hoaDon.getNguoiLap() != null ? hoaDon.getNguoiLap() : "");
                row.getCell(12).setCellStyle(dataStyle);
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            // Write to output stream
            workbook.write(outputStream);
            byte[] excelBytes = outputStream.toByteArray();
            
            log.info("Excel export completed. Size: {} bytes", excelBytes.length);
            return excelBytes;
            
        } catch (Exception e) {
            log.error("Error exporting HoaDon to Excel", e);
            throw new Exception("Error creating Excel file: " + e.getMessage(), e);
        }
    }
    
    /**
     * Create header cell style
     */
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        
        // Font
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        
        // Background
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        
        // Border
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        
        // Alignment
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        
        return style;
    }
    
    /**
     * Create data cell style
     */
    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        
        return style;
    }
    
    /**
     * Create currency cell style
     */
    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        
        // Number format with thousand separator
        DataFormat dataFormat = workbook.createDataFormat();
        style.setDataFormat(dataFormat.getFormat("#,##0.00"));
        
        return style;
    }
    
    /**
     * Create date cell style
     */
    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        
        return style;
    }
    
    /**
     * Get Vietnamese text for status
     */
    private String getTrangThaiText(String trangThai) {
        if (trangThai == null) return "";
        switch (trangThai) {
            case "DA_PHAT_HANH":
                return "Da Phat Hanh";
            case "DA_HUY":
                return "Da Huy";
            case "DIEU_CHINH":
                return "Dieu Chinh";
            default:
                return trangThai;
        }
    }
}
