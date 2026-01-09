package com.example.j2ee.service;

import com.example.j2ee.dto.ThongKeDichVuDTO;
import com.example.j2ee.dto.ThongKeDoanhThuNgayDTO;
import com.example.j2ee.dto.ThongKeHangVeDTO;
import com.example.j2ee.dto.ThongKeTongQuanDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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
     * @param startDate Ngày bắt đầu
     * @param endDate Ngày kết thúc
     */
    public ThongKeTongQuanDTO getThongKeTongQuan(LocalDate startDate, LocalDate endDate) {
        // Tổng doanh thu
        String sqlTongDoanhThu = """
            SELECT SUM(ttt.sotien) AS 'Tổng Doanh Thu'
            FROM trangthaithanhtoan ttt
            JOIN datcho dc ON ttt.madatcho = dc.madatcho
            WHERE ttt.dathanhtoan = 'Y'
            AND DATE(dc.ngaydatcho) BETWEEN ? AND ?
        """;

        BigDecimal tongDoanhThu = jdbcTemplate.queryForObject(sqlTongDoanhThu, BigDecimal.class, startDate, endDate);
        if (tongDoanhThu == null) tongDoanhThu = BigDecimal.ZERO;

        // Doanh thu dịch vụ
        String sqlDoanhThuDichVu = """
            SELECT SUM(dcdv.soluong * dcdv.dongia) AS 'Doanh Thu Dịch Vụ'
            FROM datchodichvu dcdv
            JOIN datcho dc ON dcdv.madatcho = dc.madatcho
            WHERE DATE(dc.ngaydatcho) BETWEEN ? AND ?
        """;

        BigDecimal doanhThuDichVu = jdbcTemplate.queryForObject(sqlDoanhThuDichVu, BigDecimal.class, startDate, endDate);
        if (doanhThuDichVu == null) doanhThuDichVu = BigDecimal.ZERO;

        // Doanh thu bán vé = Tổng doanh thu - Doanh thu dịch vụ
        BigDecimal doanhThuBanVe = tongDoanhThu.subtract(doanhThuDichVu);

        // Khách hàng mới
        String sqlKhachHangMoi = """
            SELECT COUNT(*) AS 'Khách Hàng Mới'
            FROM taikhoan
            WHERE DATE(ngaytao) BETWEEN ? AND ?
        """;

        Long khachHangMoi = jdbcTemplate.queryForObject(sqlKhachHangMoi, Long.class, startDate, endDate);
        if (khachHangMoi == null) khachHangMoi = 0L;

        return new ThongKeTongQuanDTO(tongDoanhThu, doanhThuBanVe, doanhThuDichVu, khachHangMoi);
    }

    /**
     * Lấy xu hướng doanh thu theo ngày trong khoảng thời gian
     * @param startDate Ngày bắt đầu
     * @param endDate Ngày kết thúc
     */
    public List<ThongKeDoanhThuNgayDTO> getDoanhThuTheoNgay(LocalDate startDate, LocalDate endDate) {
        String sql = """
            SELECT
                DATE(dc.ngaydatcho) AS 'Ngày',
                SUM(ttt.sotien) AS 'Doanh Thu'
            FROM
                datcho dc
            JOIN
                trangthaithanhtoan ttt ON dc.madatcho = ttt.madatcho
            WHERE
                ttt.dathanhtoan = 'Y'
                AND DATE(dc.ngaydatcho) BETWEEN ? AND ?
            GROUP BY
                DATE(dc.ngaydatcho)
            ORDER BY
                DATE(dc.ngaydatcho)
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Date sqlDate = rs.getDate("Ngày");
            LocalDate ngay = sqlDate.toLocalDate();
            BigDecimal doanhThu = rs.getBigDecimal("Doanh Thu");
            return new ThongKeDoanhThuNgayDTO(ngay, doanhThu);
        }, startDate, endDate);
    }

    /**
     * Lấy cơ cấu doanh thu dịch vụ theo khoảng thời gian
     * @param startDate Ngày bắt đầu
     * @param endDate Ngày kết thúc
     */
    public List<ThongKeDichVuDTO> getDoanhThuTheoDichVu(LocalDate startDate, LocalDate endDate) {
        String sql = """
            SELECT
                dvc.tendichvu AS 'Tên Dịch Vụ',
                SUM(dcdv.soluong * dcdv.dongia) AS 'Tổng Doanh Thu Dịch Vụ'
            FROM
                datchodichvu dcdv
            JOIN
                luachondichvu ldv ON dcdv.maluachon = ldv.maluachon
            JOIN
                dichvucungcap dvc ON ldv.madichvu = dvc.madichvu
            JOIN
                datcho dc ON dcdv.madatcho = dc.madatcho
            WHERE
                DATE(dc.ngaydatcho) BETWEEN ? AND ?
            GROUP BY
                dvc.tendichvu
            ORDER BY
                'Tổng Doanh Thu Dịch Vụ' DESC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            String tenDichVu = rs.getString("Tên Dịch Vụ");
            BigDecimal tongDoanhThu = rs.getBigDecimal("Tổng Doanh Thu Dịch Vụ");
            return new ThongKeDichVuDTO(tenDichVu, tongDoanhThu);
        }, startDate, endDate);
    }

    /**
     * Lấy cơ cấu doanh thu theo hạng vé trong khoảng thời gian
     * @param startDate Ngày bắt đầu
     * @param endDate Ngày kết thúc
     */
    public List<ThongKeHangVeDTO> getDoanhThuTheoHangVe(LocalDate startDate, LocalDate endDate) {
        String sql = """
            WITH
                ServiceCost AS (
                    SELECT
                        madatcho,
                        SUM(soluong * dongia) AS total_service_cost
                    FROM
                        datchodichvu
                    GROUP BY
                        madatcho
                ),

                TicketCost AS (
                    SELECT
                        dc.madatcho,
                        ttt.sotien - IFNULL(sc.total_service_cost, 0) AS ticket_revenue,
                        CASE
                            WHEN hv.tenhangve = 'Economy' THEN 'Phổ thông'
                            ELSE 'Thương gia'
                        END AS NhomHangVe
                    FROM
                        datcho dc
                    JOIN
                        trangthaithanhtoan ttt ON dc.madatcho = ttt.madatcho
                    JOIN
                        chitietghe ctg ON dc.maghe = ctg.maghe
                    JOIN
                        hangve hv ON ctg.mahangve = hv.mahangve
                    LEFT JOIN
                        ServiceCost sc ON dc.madatcho = sc.madatcho
                    WHERE
                        ttt.dathanhtoan = 'Y'
                        AND DATE(dc.ngaydatcho) BETWEEN ? AND ?
                )

            SELECT
                NhomHangVe,
                SUM(ticket_revenue) AS 'Doanh Thu Theo Hạng Vé'
            FROM
                TicketCost
            GROUP BY
                NhomHangVe
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            String nhomHangVe = rs.getString("NhomHangVe");
            BigDecimal doanhThuTheoHangVe = rs.getBigDecimal("Doanh Thu Theo Hạng Vé");
            return new ThongKeHangVeDTO(nhomHangVe, doanhThuTheoHangVe);
        }, startDate, endDate);
    }
}