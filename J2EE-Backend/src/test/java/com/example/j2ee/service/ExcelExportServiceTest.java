package com.example.j2ee.service;

import com.example.j2ee.dto.ThongKeChangBayDTO;
import com.example.j2ee.dto.ThongKeDoanhThuNgayDTO;
import com.example.j2ee.dto.ThongKeHangVeDTO;
import com.example.j2ee.dto.ThongKeTongQuanDTO;
import com.example.j2ee.dto.ThongKeTrangThaiDonHangDTO;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for ExcelExportService.exportThongKeToExcel.
 * POI thuần túy — không cần Spring context hay database.
 */
class ExcelExportServiceTest {

    private final ExcelExportService excelExportService = new ExcelExportService();

    @Test
    void exportThongKeToExcel_duLieuDayDu_traVeFileXlsxHopLe() throws Exception {
        ThongKeTongQuanDTO tongQuan =
                new ThongKeTongQuanDTO(new BigDecimal("1000000"), new BigDecimal("800000"),
                        new BigDecimal("200000"), 5L);
        List<ThongKeDoanhThuNgayDTO> doanhThuNgay = List.of(
                new ThongKeDoanhThuNgayDTO(LocalDate.of(2026, 2, 1), new BigDecimal("400000")),
                new ThongKeDoanhThuNgayDTO(LocalDate.of(2026, 2, 2), new BigDecimal("600000")));
        List<ThongKeChangBayDTO> topChangBay = List.of(
                new ThongKeChangBayDTO("SGN", "HAN", "SGN - HAN", 10L, new BigDecimal("500000")));
        List<ThongKeHangVeDTO> hangVe = List.of(
                new ThongKeHangVeDTO("Economy", new BigDecimal("700000")));
        List<ThongKeTrangThaiDonHangDTO> trangThai = List.of(
                new ThongKeTrangThaiDonHangDTO("ĐÃ THANH TOÁN", 8L, new BigDecimal("80.0"), "Da thanh toan"));

        byte[] bytes = excelExportService.exportThongKeToExcel(
                tongQuan, doanhThuNgay, topChangBay, hangVe, trangThai, List.of());

        assertNotNull(bytes);
        assertTrue(bytes.length > 0);
        // ZIP magic bytes của file xlsx (OOXML)
        assertEquals('P', (char) bytes[0]);
        assertEquals('K', (char) bytes[1]);

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            assertEquals(5, workbook.getNumberOfSheets());
            Sheet tongQuanSheet = workbook.getSheet("Tong quan");
            assertNotNull(tongQuanSheet);
            assertEquals("Tong doanh thu", tongQuanSheet.getRow(1).getCell(0).getStringCellValue());
            assertEquals(1000000.0, tongQuanSheet.getRow(1).getCell(1).getNumericCellValue());
        }
    }

    @Test
    void exportThongKeToExcel_tatCaRong_traVeWorkbookRong() throws Exception {
        byte[] bytes = excelExportService.exportThongKeToExcel(null, null, null, null, null, null);

        assertNotNull(bytes);
        assertTrue(bytes.length > 0);

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            assertEquals(0, workbook.getNumberOfSheets());
        }
    }
}
