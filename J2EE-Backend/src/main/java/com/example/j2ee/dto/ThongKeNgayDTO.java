package com.example.j2ee.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cho thống kê trong ngày
 * Dùng cho endpoint /thongke/trong-ngay
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ThongKeNgayDTO {

    /** Doanh thu hôm nay (từ bảng hoadon) */
    private BigDecimal doanhThuHomNay;

    /** Số đơn hàng hôm nay */
    private Long soDonHangHomNay;

    /** Số vé đã bán hôm nay */
    private Long soVeDaBanHomNay;

    /** Số khách đã check-in hôm nay */
    private Long soKhachCheckInHomNay;

    /** Tỷ lệ hủy đơn hàng hôm nay (%) */
    private BigDecimal tyLeHuyHomNay;

    /** Số hóa đơn đã phát hành hôm nay */
    private Long soHoaDonHomNay;
}
