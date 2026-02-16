package com.example.j2ee.service;

import com.example.j2ee.dto.ThongKeDichVuDTO;
import com.example.j2ee.dto.ThongKeDoanhThuNgayDTO;
import com.example.j2ee.dto.ThongKeHangVeDTO;
import com.example.j2ee.dto.ThongKeNgayDTO;
import com.example.j2ee.dto.ThongKeSoSanhDTO;
import com.example.j2ee.dto.ThongKeTongQuanDTO;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

@Service
public class ThongKeService {

    private final JdbcTemplate jdbcTemplate;

    public ThongKeService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Lấy thống kê tổng quan theo khoảng thời gian
     * 
     * @param startDate Ngày bắt đầu
     * @param endDate   Ngày kết thúc
     */
    @Cacheable(value = "thongKeTongQuan", key = "#startDate.toString() + '-' + #endDate.toString()")
    public ThongKeTongQuanDTO getThongKeTongQuan(LocalDate startDate, LocalDate endDate) {
        // Tổng doanh thu (từ bảng hoadon - chỉ tính hóa đơn đã phát hành)
        String sqlTongDoanhThu = """
                    SELECT COALESCE(SUM(hd.tongthanhtoan), 0) AS TongDoanhThu
                    FROM hoadon hd
                    WHERE DATE(hd.ngaylap) BETWEEN ? AND ?
                    AND hd.trangthai = 'DA_PHAT_HANH'
                    AND hd.da_xoa = 0
                """;

        BigDecimal tongDoanhThu = jdbcTemplate.queryForObject(sqlTongDoanhThu, BigDecimal.class, startDate, endDate);
        if (tongDoanhThu == null)
            tongDoanhThu = BigDecimal.ZERO;

        // Doanh thu dịch vụ
        String sqlDoanhThuDichVu = """
                    SELECT SUM(dcdv.soluong * dcdv.dongia) AS DoanhThuDichVu
                    FROM datchodichvu dcdv
                    JOIN datcho dc ON dcdv.madatcho = dc.madatcho
                    JOIN donhang dh ON dc.madonhang = dh.madonhang
                    JOIN trangthaithanhtoan ttt ON dh.madonhang = ttt.madonhang
                    WHERE ttt.dathanhtoan = 1
                    AND DATE(dc.ngaydatcho) BETWEEN ? AND ?
                """;

        BigDecimal doanhThuDichVu = jdbcTemplate.queryForObject(sqlDoanhThuDichVu, BigDecimal.class, startDate,
                endDate);
        if (doanhThuDichVu == null)
            doanhThuDichVu = BigDecimal.ZERO;

        // Doanh thu bán vé = Tổng doanh thu - Doanh thu dịch vụ
        BigDecimal doanhThuBanVe = tongDoanhThu.subtract(doanhThuDichVu);

        // Khách hàng mới
        String sqlKhachHangMoi = """
                    SELECT COUNT(*) AS 'Khách Hàng Mới'
                    FROM taikhoan
                    WHERE DATE(ngaytao) BETWEEN ? AND ?
                """;

        Long khachHangMoi = jdbcTemplate.queryForObject(sqlKhachHangMoi, Long.class, startDate, endDate);
        if (khachHangMoi == null)
            khachHangMoi = 0L;

        return new ThongKeTongQuanDTO(tongDoanhThu, doanhThuBanVe, doanhThuDichVu, khachHangMoi);
    }

    /**
     * Lấy xu hướng doanh thu theo ngày trong khoảng thời gian
     * 
     * @param startDate Ngày bắt đầu
     * @param endDate   Ngày kết thúc
     */
    @Cacheable(value = "doanhThuTheoNgay", key = "#startDate.toString() + '-' + #endDate.toString()")
    public List<ThongKeDoanhThuNgayDTO> getDoanhThuTheoNgay(LocalDate startDate, LocalDate endDate) {
        // Lấy doanh thu theo ngày từ bảng hoadon (hóa đơn đã phát hành)
        String sql = """
                    SELECT
                        DATE(hd.ngaylap) AS Ngay,
                        COALESCE(SUM(hd.tongthanhtoan), 0) AS DoanhThu
                    FROM
                        hoadon hd
                    WHERE
                        hd.trangthai = 'DA_PHAT_HANH'
                        AND hd.da_xoa = 0
                        AND DATE(hd.ngaylap) BETWEEN ? AND ?
                    GROUP BY
                        DATE(hd.ngaylap)
                    ORDER BY
                        DATE(hd.ngaylap)
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Date sqlDate = rs.getDate("Ngay");
            LocalDate ngay = sqlDate.toLocalDate();
            BigDecimal doanhThu = rs.getBigDecimal("DoanhThu");
            return new ThongKeDoanhThuNgayDTO(ngay, doanhThu);
        }, startDate, endDate);
    }

    /**
     * Lấy cơ cấu doanh thu dịch vụ theo khoảng thời gian
     * 
     * @param startDate Ngày bắt đầu
     * @param endDate   Ngày kết thúc
     */
    public List<ThongKeDichVuDTO> getDoanhThuTheoDichVu(LocalDate startDate, LocalDate endDate) {
        String sql = """
                    SELECT
                        dvc.tendichvu AS TenDichVu,
                        SUM(dcdv.soluong * dcdv.dongia) AS TongDoanhThuDichVu
                    FROM
                        datchodichvu dcdv
                    JOIN
                        luachondichvu ldv ON dcdv.maluachon = ldv.maluachon
                    JOIN
                        dichvucungcap dvc ON ldv.madichvu = dvc.madichvu
                    JOIN
                        datcho dc ON dcdv.madatcho = dc.madatcho
                    JOIN
                        donhang dh ON dc.madonhang = dh.madonhang
                    JOIN
                        trangthaithanhtoan ttt ON dh.madonhang = ttt.madonhang
                    WHERE
                        ttt.dathanhtoan = 1
                        AND DATE(dc.ngaydatcho) BETWEEN ? AND ?
                    GROUP BY
                        dvc.tendichvu
                    ORDER BY
                        TongDoanhThuDichVu DESC
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            String tenDichVu = rs.getString("TenDichVu");
            BigDecimal tongDoanhThu = rs.getBigDecimal("TongDoanhThuDichVu");
            return new ThongKeDichVuDTO(tenDichVu, tongDoanhThu);
        }, startDate, endDate);
    }

    /**
     * Lấy cơ cấu doanh thu theo hạng vé trong khoảng thời gian
     * (Tính từ hóa đơn và phân bổ theo hạng vé của đặt chỗ trong đơn hàng)
     * 
     * @param startDate Ngày bắt đầu
     * @param endDate   Ngày kết thúc
     */
    public List<ThongKeHangVeDTO> getDoanhThuTheoHangVe(LocalDate startDate, LocalDate endDate) {
        // Lấy doanh thu theo hạng vé từ hoadon join với donhang, datcho
        String sql = """
                    SELECT
                        CASE
                            WHEN hv.tenhangve IN ('Economy', 'Economy Saver') THEN 'Phổ thông'
                            ELSE 'Thương gia'
                        END AS NhomHangVe,
                        SUM(dc.giave) AS DoanhThuHangVe
                    FROM
                        hoadon hd
                    JOIN
                        donhang dh ON hd.madonhang = dh.madonhang
                    JOIN
                        datcho dc ON dh.madonhang = dc.madonhang
                    JOIN
                        hangve hv ON dc.mahangve = hv.mahangve
                    WHERE
                        hd.trangthai = 'DA_PHAT_HANH'
                        AND hd.da_xoa = 0
                        AND DATE(hd.ngaylap) BETWEEN ? AND ?
                    GROUP BY
                        NhomHangVe
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            String nhomHangVe = rs.getString("NhomHangVe");
            BigDecimal doanhThuTheoHangVe = rs.getBigDecimal("DoanhThuHangVe");
            return new ThongKeHangVeDTO(nhomHangVe, doanhThuTheoHangVe);
        }, startDate, endDate);
    }

    /**
     * Thống kê trong ngày hôm nay
     */
    @Cacheable(value = "thongKeNgay")
    public ThongKeNgayDTO getThongKeNgay() {
        LocalDate today = LocalDate.now();

        // 1. Doanh thu hôm nay (từ bảng hoadon - chỉ tính hóa đơn đã phát hành)
        String sqlDoanhThu = """
                    SELECT COALESCE(SUM(hd.tongthanhtoan), 0)
                    FROM hoadon hd
                    WHERE DATE(hd.ngaylap) = ?
                    AND hd.trangthai = 'DA_PHAT_HANH'
                    AND hd.da_xoa = 0
                """;
        BigDecimal doanhThuHomNay = jdbcTemplate.queryForObject(sqlDoanhThu, BigDecimal.class, today);
        if (doanhThuHomNay == null)
            doanhThuHomNay = BigDecimal.ZERO;

        // 2. Số đơn hàng hôm nay
        String sqlDonHang = """
                    SELECT COUNT(*)
                    FROM donhang
                    WHERE DATE(ngaydat) = ?
                    AND da_xoa = 0
                """;
        Long soDonHangHomNay = jdbcTemplate.queryForObject(sqlDonHang, Long.class, today);
        if (soDonHangHomNay == null)
            soDonHangHomNay = 0L;

        // 3. Số vé đã bán hôm nay (số đặt chỗ đã thanh toán)
        String sqlVeDaBan = """
                    SELECT COUNT(*)
                    FROM datcho dc
                    JOIN donhang dh ON dc.madonhang = dh.madonhang
                    JOIN trangthaithanhtoan ttt ON dh.madonhang = ttt.madonhang
                    WHERE DATE(dc.ngaydatcho) = ?
                    AND ttt.dathanhtoan = 1
                """;
        Long soVeDaBanHomNay = jdbcTemplate.queryForObject(sqlVeDaBan, Long.class, today);
        if (soVeDaBanHomNay == null)
            soVeDaBanHomNay = 0L;

        // 4. Số khách check-in hôm nay
        String sqlCheckIn = """
                    SELECT COUNT(*)
                    FROM datcho
                    WHERE checkin_status = 1
                    AND DATE(checkin_time) = ?
                """;
        Long soKhachCheckInHomNay = jdbcTemplate.queryForObject(sqlCheckIn, Long.class, today);
        if (soKhachCheckInHomNay == null)
            soKhachCheckInHomNay = 0L;

        // 5. Tỷ lệ hủy hôm nay
        String sqlTongDonHang = """
                    SELECT COUNT(*) FROM donhang WHERE DATE(ngaydat) = ? AND da_xoa = 0
                """;
        String sqlDonHangHuy = """
                    SELECT COUNT(*) FROM donhang WHERE DATE(ngaydat) = ? AND trangthai = 'ĐÃ HỦY' AND da_xoa = 0
                """;
        Long tongDonHang = jdbcTemplate.queryForObject(sqlTongDonHang, Long.class, today);
        Long donHangHuy = jdbcTemplate.queryForObject(sqlDonHangHuy, Long.class, today);
        if (tongDonHang == null)
            tongDonHang = 0L;
        if (donHangHuy == null)
            donHangHuy = 0L;

        BigDecimal tyLeHuyHomNay = BigDecimal.ZERO;
        if (tongDonHang > 0) {
            tyLeHuyHomNay = BigDecimal.valueOf(donHangHuy)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(tongDonHang), 2, RoundingMode.HALF_UP);
        }

        // 6. Số hóa đơn đã phát hành hôm nay
        String sqlHoaDon = """
                    SELECT COUNT(*)
                    FROM hoadon
                    WHERE DATE(ngaylap) = ?
                    AND trangthai = 'DA_PHAT_HANH'
                    AND da_xoa = 0
                """;
        Long soHoaDonHomNay = jdbcTemplate.queryForObject(sqlHoaDon, Long.class, today);
        if (soHoaDonHomNay == null)
            soHoaDonHomNay = 0L;

        return new ThongKeNgayDTO(
                doanhThuHomNay,
                soDonHangHomNay,
                soVeDaBanHomNay,
                soKhachCheckInHomNay,
                tyLeHuyHomNay,
                soHoaDonHomNay);
    }

    /**
     * Thống kê so sánh giữa các kỳ
     * 
     * @param tuNgay  Ngày bắt đầu kỳ hiện tại
     * @param denNgay Ngày kết thúc kỳ hiện tại
     * @param kyTruoc Loại kỳ so sánh: WEEK, MONTH, YEAR
     */
    public ThongKeSoSanhDTO getThongKeSoSanh(LocalDate tuNgay, LocalDate denNgay, String kyTruoc) {
        // Tính khoảng thời gian kỳ trước dựa trên kyTruoc
        LocalDate tuNgayTruoc;
        LocalDate denNgayTruoc;

        switch (kyTruoc.toUpperCase()) {
            case "WEEK":
                tuNgayTruoc = tuNgay.minusWeeks(1);
                denNgayTruoc = denNgay.minusWeeks(1);
                break;
            case "MONTH":
                tuNgayTruoc = tuNgay.minusMonths(1);
                denNgayTruoc = denNgay.minusMonths(1);
                break;
            case "YEAR":
                tuNgayTruoc = tuNgay.minusYears(1);
                denNgayTruoc = denNgay.minusYears(1);
                break;
            default:
                tuNgayTruoc = tuNgay.minusWeeks(1);
                denNgayTruoc = denNgay.minusWeeks(1);
        }

        // Query doanh thu kỳ hiện tại (từ bảng hoadon)
        String sqlDoanhThu = """
                    SELECT COALESCE(SUM(hd.tongthanhtoan), 0)
                    FROM hoadon hd
                    WHERE hd.trangthai = 'DA_PHAT_HANH'
                    AND hd.da_xoa = 0
                    AND DATE(hd.ngaylap) BETWEEN ? AND ?
                """;
        BigDecimal doanhThuHienTai = jdbcTemplate.queryForObject(sqlDoanhThu, BigDecimal.class, tuNgay, denNgay);
        BigDecimal doanhThuTruoc = jdbcTemplate.queryForObject(sqlDoanhThu, BigDecimal.class, tuNgayTruoc,
                denNgayTruoc);
        if (doanhThuHienTai == null)
            doanhThuHienTai = BigDecimal.ZERO;
        if (doanhThuTruoc == null)
            doanhThuTruoc = BigDecimal.ZERO;

        // Query số lượng vé
        String sqlSoLuongVe = """
                    SELECT COUNT(*)
                    FROM datcho dc
                    JOIN donhang dh ON dc.madonhang = dh.madonhang
                    JOIN trangthaithanhtoan ttt ON dh.madonhang = ttt.madonhang
                    WHERE ttt.dathanhtoan = 1
                    AND DATE(dc.ngaydatcho) BETWEEN ? AND ?
                """;
        Long soLuongVeHienTai = jdbcTemplate.queryForObject(sqlSoLuongVe, Long.class, tuNgay, denNgay);
        Long soLuongVeTruoc = jdbcTemplate.queryForObject(sqlSoLuongVe, Long.class, tuNgayTruoc, denNgayTruoc);
        if (soLuongVeHienTai == null)
            soLuongVeHienTai = 0L;
        if (soLuongVeTruoc == null)
            soLuongVeTruoc = 0L;

        // Query số đơn hàng
        String sqlSoDonHang = """
                    SELECT COUNT(*) FROM donhang
                    WHERE DATE(ngaydat) BETWEEN ? AND ?
                """;
        Long soDonHangHienTai = jdbcTemplate.queryForObject(sqlSoDonHang, Long.class, tuNgay, denNgay);
        Long soDonHangTruoc = jdbcTemplate.queryForObject(sqlSoDonHang, Long.class, tuNgayTruoc, denNgayTruoc);
        if (soDonHangHienTai == null)
            soDonHangHienTai = 0L;
        if (soDonHangTruoc == null)
            soDonHangTruoc = 0L;

        // Tính phần trăm thay đổi
        BigDecimal phanTramDoanhThu = calculatePercentChange(doanhThuHienTai, doanhThuTruoc);
        BigDecimal phanTramVe = calculatePercentChange(BigDecimal.valueOf(soLuongVeHienTai),
                BigDecimal.valueOf(soLuongVeTruoc));
        BigDecimal phanTramDonHang = calculatePercentChange(BigDecimal.valueOf(soDonHangHienTai),
                BigDecimal.valueOf(soDonHangTruoc));

        return new ThongKeSoSanhDTO(
                doanhThuHienTai,
                doanhThuTruoc,
                phanTramDoanhThu,
                soLuongVeHienTai,
                soLuongVeTruoc,
                phanTramVe,
                soDonHangHienTai,
                soDonHangTruoc,
                phanTramDonHang,
                kyTruoc);
    }

    /**
     * Helper method để tính % thay đổi
     */
    private BigDecimal calculatePercentChange(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            if (current != null && current.compareTo(BigDecimal.ZERO) > 0) {
                return BigDecimal.valueOf(100); // Tăng 100% nếu trước đó = 0
            }
            return BigDecimal.ZERO;
        }
        return current.subtract(previous)
                .multiply(BigDecimal.valueOf(100))
                .divide(previous, 2, RoundingMode.HALF_UP);
    }
}