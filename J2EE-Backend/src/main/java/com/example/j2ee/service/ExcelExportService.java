package com.example.j2ee.service;

import com.example.j2ee.dto.hoadon.HoaDonResponse;
import com.example.j2ee.dto.ThongKeChangBayDTO;
import com.example.j2ee.dto.ThongKeDoanhThuNgayDTO;
import com.example.j2ee.dto.ThongKeHangVeDTO;
import com.example.j2ee.dto.ThongKeTongQuanDTO;
import com.example.j2ee.dto.ThongKeTrangThaiDonHangDTO;
import com.example.j2ee.model.HanhKhach;
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
     * Export thong ke bao cao tong hop ra Excel (nhieu sheet).
     * Chi tao sheet cho du lieu non-empty; tongQuan null thi bo qua sheet Tong quan.
     *
     * @return Excel file as byte array
     * @throws Exception if export fails
     */
    public byte[] exportThongKeToExcel(
            ThongKeTongQuanDTO tongQuan,
            List<ThongKeDoanhThuNgayDTO> doanhThuNgay,
            List<ThongKeChangBayDTO> topChangBay,
            List<ThongKeHangVeDTO> hangVe,
            List<ThongKeTrangThaiDonHangDTO> trangThaiDonHang,
            List<HanhKhach> hanhKhach) throws Exception {
        log.info("Exporting thong ke to Excel");

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle percentStyle = createPercentStyle(workbook);

            if (tongQuan != null) {
                Sheet sheet = workbook.createSheet("Tong quan");
                fillHeader(sheet, new String[]{"Chi tieu", "Gia tri"}, headerStyle);
                int r = 1;
                r = kvRow(sheet, r, "Tong doanh thu", money(tongQuan.getTongDoanhThu()), currencyStyle, dataStyle);
                r = kvRow(sheet, r, "Doanh thu ban ve", money(tongQuan.getDoanhThuBanVe()), currencyStyle, dataStyle);
                r = kvRow(sheet, r, "Doanh thu dich vu", money(tongQuan.getDoanhThuDichVu()), currencyStyle, dataStyle);
                textRow(sheet, r, "Khach hang moi", tongQuan.getKhachHangMoi() != null ? String.valueOf(tongQuan.getKhachHangMoi()) : "0", dataStyle);
                autoSize(sheet, 2);
            }

            if (doanhThuNgay != null && !doanhThuNgay.isEmpty()) {
                Sheet sheet = workbook.createSheet("Doanh thu ngay");
                fillHeader(sheet, new String[]{"STT", "Ngay", "Doanh thu"}, headerStyle);
                int r = 1;
                for (ThongKeDoanhThuNgayDTO item : doanhThuNgay) {
                    Row row = sheet.createRow(r++);
                    numCell(row, 0, r - 1, dataStyle);
                    textCell(row, 1, item.getNgay() != null ? item.getNgay().toString() : "", dateStyle);
                    numCell(row, 2, money(item.getDoanhThu()), currencyStyle);
                }
                autoSize(sheet, 3);
            }

            if (topChangBay != null && !topChangBay.isEmpty()) {
                Sheet sheet = workbook.createSheet("Top chang bay");
                fillHeader(sheet, new String[]{"STT", "Chang bay", "San bay di", "San bay den", "So ve ban", "Doanh thu"}, headerStyle);
                int r = 1;
                for (ThongKeChangBayDTO cb : topChangBay) {
                    Row row = sheet.createRow(r++);
                    numCell(row, 0, r - 1, dataStyle);
                    textCell(row, 1, nz(cb.getChangBay()), dataStyle);
                    textCell(row, 2, nz(cb.getSanBayDi()), dataStyle);
                    textCell(row, 3, nz(cb.getSanBayDen()), dataStyle);
                    numCell(row, 4, cb.getSoVeBan() != null ? cb.getSoVeBan() : 0, dataStyle);
                    numCell(row, 5, money(cb.getDoanhThu()), currencyStyle);
                }
                autoSize(sheet, 6);
            }

            if (hangVe != null && !hangVe.isEmpty()) {
                Sheet sheet = workbook.createSheet("Hang ve");
                fillHeader(sheet, new String[]{"STT", "Nhom hang ve", "Doanh thu"}, headerStyle);
                int r = 1;
                for (ThongKeHangVeDTO hv : hangVe) {
                    Row row = sheet.createRow(r++);
                    numCell(row, 0, r - 1, dataStyle);
                    textCell(row, 1, nz(hv.getNhomHangVe()), dataStyle);
                    numCell(row, 2, money(hv.getDoanhThuTheoHangVe()), currencyStyle);
                }
                autoSize(sheet, 3);
            }

            if (trangThaiDonHang != null && !trangThaiDonHang.isEmpty()) {
                Sheet sheet = workbook.createSheet("Trang thai don hang");
                fillHeader(sheet, new String[]{"STT", "Trang thai", "So don hang", "Ty le (%)", "Mo ta"}, headerStyle);
                int r = 1;
                for (ThongKeTrangThaiDonHangDTO tt : trangThaiDonHang) {
                    Row row = sheet.createRow(r++);
                    numCell(row, 0, r - 1, dataStyle);
                    textCell(row, 1, nz(tt.getTrangThai()), dataStyle);
                    numCell(row, 2, tt.getSoDonHang() != null ? tt.getSoDonHang() : 0, dataStyle);
                    if (tt.getTyLe() != null) {
                        Cell c = row.createCell(3);
                        c.setCellValue(tt.getTyLe().doubleValue());
                        c.setCellStyle(percentStyle);
                    } else {
                        textCell(row, 3, "", dataStyle);
                    }
                    textCell(row, 4, nz(tt.getMoTa()), dataStyle);
                }
                autoSize(sheet, 5);
            }

            if (hanhKhach != null && !hanhKhach.isEmpty()) {
                Sheet sheet = workbook.createSheet("Hanh khach");
                fillHeader(sheet, new String[]{"STT", "Ma KH", "Ho va ten", "Email", "SDT", "Gioi tinh", "Quoc gia"}, headerStyle);
                int r = 1;
                for (HanhKhach kh : hanhKhach) {
                    Row row = sheet.createRow(r++);
                    numCell(row, 0, r - 1, dataStyle);
                    numCell(row, 1, kh.getMaHanhKhach(), dataStyle);
                    textCell(row, 2, nz(kh.getHoVaTen()), dataStyle);
                    textCell(row, 3, nz(kh.getEmail()), dataStyle);
                    textCell(row, 4, nz(kh.getSoDienThoai()), dataStyle);
                    textCell(row, 5, nz(kh.getGioiTinh()), dataStyle);
                    textCell(row, 6, nz(kh.getQuocGia()), dataStyle);
                }
                autoSize(sheet, 7);
            }

            workbook.write(outputStream);
            byte[] excelBytes = outputStream.toByteArray();

            log.info("Thong ke Excel export completed. Size: {} bytes", excelBytes.length);
            return excelBytes;

        } catch (Exception e) {
            log.error("Error exporting thong ke to Excel", e);
            throw new Exception("Error creating Excel file: " + e.getMessage(), e);
        }
    }

    private double money(java.math.BigDecimal v) {
        return v != null ? v.doubleValue() : 0;
    }

    private String nz(String v) {
        return v != null ? v : "";
    }

    private void fillHeader(Sheet sheet, String[] headers, CellStyle headerStyle) {
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private void autoSize(Sheet sheet, int cols) {
        for (int i = 0; i < cols; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void textCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value != null ? value : "");
        cell.setCellStyle(style);
    }

    private void numCell(Row row, int col, double value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private int kvRow(Sheet sheet, int rowNum, String key, double value, CellStyle valueStyle, CellStyle keyStyle) {
        Row row = sheet.createRow(rowNum);
        textCell(row, 0, key, keyStyle);
        numCell(row, 1, value, valueStyle);
        return rowNum + 1;
    }

    private void textRow(Sheet sheet, int rowNum, String key, String value, CellStyle style) {
        Row row = sheet.createRow(rowNum);
        textCell(row, 0, key, style);
        textCell(row, 1, value, style);
    }

    /**
     * Create percent cell style (gia tri da o don vi %)
     */
    private CellStyle createPercentStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        DataFormat dataFormat = workbook.createDataFormat();
        style.setDataFormat(dataFormat.getFormat("0.0\"%\""));

        return style;
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
