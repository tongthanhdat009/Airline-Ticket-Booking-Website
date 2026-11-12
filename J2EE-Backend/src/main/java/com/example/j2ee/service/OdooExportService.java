package com.example.j2ee.service;

import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.DatChoDichVu;
import com.example.j2ee.model.HoanTien;
import com.example.j2ee.model.DonHang;
import com.example.j2ee.model.KhuyenMaiDatCho;
import com.example.j2ee.model.TrangThaiThanhToan;
import com.example.j2ee.repository.DonHangRepository;
import com.example.j2ee.repository.HoanTienRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Export đơn đã thanh toán cho odoo-connector-service (batch reconcile).
 *
 * Payload dùng chung shape UnifiedOrder với webhook realtime (OdooHookService)
 * để connector ingest cả hai đường bằng một model.
 */
@Service
public class OdooExportService {

    public static final String PAID_STATUS = "ĐÃ THANH TOÁN";
    public static final String REFUNDED_STATUS = "DA_HOAN_TIEN";
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final DonHangRepository donHangRepository;
    private final HoanTienRepository hoanTienRepository;

    public OdooExportService(DonHangRepository donHangRepository, HoanTienRepository hoanTienRepository) {
        this.donHangRepository = donHangRepository;
        this.hoanTienRepository = hoanTienRepository;
    }

    @Transactional(readOnly = true)
    public ExportResult paidOrders(String since) {
        LocalDateTime sinceAt = parseSince(since);
        List<DonHang> orders = donHangRepository.findPaidForExport(PAID_STATUS, sinceAt);

        List<Map<String, Object>> data = new ArrayList<>();
        LocalDateTime cursor = sinceAt;
        for (DonHang donHang : orders) {
            data.add(toPayload(donHang));
            if (donHang.getUpdatedAt() != null && donHang.getUpdatedAt().isAfter(cursor)) {
                cursor = donHang.getUpdatedAt();
            }
        }
        return new ExportResult(data, cursor.format(ISO));
    }

    /**
     * Hoàn tiền đã xử lý, gom theo đơn (PNR) để connector tạo credit note.
     * Mỗi lần hoàn = 1 ghế, nên payload mang kèm dòng hàng tương ứng.
     */
    @Transactional(readOnly = true)
    public ExportResult refundedOrders(String since) {
        LocalDateTime sinceAt = parseSince(since);
        List<HoanTien> refunds = hoanTienRepository.findRefundedForExport(REFUNDED_STATUS, sinceAt);

        List<Map<String, Object>> data = new ArrayList<>();
        LocalDateTime cursor = sinceAt;
        for (HoanTien h : refunds) {
            DatCho datCho = h.getDatCho();
            DonHang donHang = datCho != null ? datCho.getDonHang() : null;
            if (donHang == null || donHang.getPnr() == null) {
                continue;
            }
            String maChuyenBay = datCho.getChuyenBay() != null ? String.valueOf(datCho.getChuyenBay().getMaChuyenBay()) : "?";
            String maHangVe = datCho.getHangVe() != null ? String.valueOf(datCho.getHangVe().getMaHangVe()) : "?";

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("source", "airline");
            item.put("source_order_id", donHang.getPnr());
            item.put("refund_id", "HP-" + h.getMaHP());
            item.put("amount_vnd", (int) toLong(h.getSoTienHoan()));
            item.put("reason", h.getLyDoHoanTien() != null ? h.getLyDoHoanTien() : "");
            item.put("refunded_at", h.getNgayHoan() != null ? h.getNgayHoan().format(ISO) : "");
            item.put("lines", List.of(line(
                    "FLIGHT-" + maChuyenBay + "-" + maHangVe,
                    "Ve " + maHangVe + " chuyen " + maChuyenBay,
                    1,
                    datCho.getGiaVe())));
            data.add(item);
            if (h.getNgayHoan() != null && h.getNgayHoan().isAfter(cursor)) {
                cursor = h.getNgayHoan();
            }
        }
        return new ExportResult(data, cursor.format(ISO));
    }

    private Map<String, Object> toPayload(DonHang donHang) {        List<Map<String, Object>> lines = new ArrayList<>();
        long discount = 0;
        for (DatCho datCho : donHang.getDanhSachDatCho()) {
            String maChuyenBay = datCho.getChuyenBay() != null ? String.valueOf(datCho.getChuyenBay().getMaChuyenBay()) : "?";
            String maHangVe = datCho.getHangVe() != null ? String.valueOf(datCho.getHangVe().getMaHangVe()) : "?";
            lines.add(line("FLIGHT-" + maChuyenBay + "-" + maHangVe, "Ve " + maHangVe + " chuyen " + maChuyenBay, 1, datCho.getGiaVe()));

            for (DatChoDichVu dichVu : datCho.getDanhSachDichVu()) {
                String maLuaChon = dichVu.getLuaChonDichVu() != null ? String.valueOf(dichVu.getLuaChonDichVu().getMaLuaChon()) : "?";
                String ten = dichVu.getLuaChonDichVu() != null ? dichVu.getLuaChonDichVu().getTenLuaChon() : "Dich vu";
                lines.add(line("SVC-" + maLuaChon, ten, dichVu.getSoLuong(), dichVu.getDonGia()));
            }
            for (KhuyenMaiDatCho khuyenMai : datCho.getDanhSachKhuyenMai()) {
                discount += toLong(khuyenMai.getSoTienGiam());
            }
        }

        TrangThaiThanhToan thanhToan = donHang.getTrangThaiThanhToan();
        Map<String, Object> order = new LinkedHashMap<>();
        order.put("source", "airline");
        order.put("source_order_id", donHang.getPnr());
        order.put("customer_name", donHang.getHanhKhachNguoiDat() != null ? donHang.getHanhKhachNguoiDat().getHoVaTen() : "");
        order.put("customer_email", nullToEmpty(donHang.getEmailNguoiDat()));
        order.put("customer_phone", nullToEmpty(donHang.getSoDienThoaiNguoiDat()));
        order.put("address", "");
        order.put("lines", lines);
        order.put("discount_vnd", (int) discount);
        order.put("shipping_vnd", 0);
        order.put("paid_vnd", (int) toLong(donHang.getTongGia()));
        order.put("payment_method", thanhToan != null ? nullToEmpty(thanhToan.getPhuongThucThanhToan()) : "");
        order.put("provider_ref", thanhToan != null ? nullToEmpty(thanhToan.getTransactionCode()) : "");
        order.put("origin_note", "airline:donhang:" + donHang.getMaDonHang());
        return order;
    }

    private Map<String, Object> line(String sku, String name, int qty, BigDecimal price) {
        Map<String, Object> line = new LinkedHashMap<>();
        line.put("sku", sku);
        line.put("name", name);
        line.put("qty", qty);
        line.put("unit_price_vnd", (int) toLong(price));
        line.put("is_service", true);
        return line;
    }

    private LocalDateTime parseSince(String since) {
        if (since == null || since.isBlank()) {
            return LocalDateTime.of(1970, 1, 1, 0, 0);
        }
        try {
            return LocalDateTime.parse(since.trim());
        } catch (Exception e) {
            return LocalDateTime.of(1970, 1, 1, 0, 0);
        }
    }

    private long toLong(BigDecimal value) {
        // VND khong co phan thap phan: lam tron het (cat phan thap phan lech VND/don)
        return value == null ? 0L : value.setScale(0, RoundingMode.HALF_UP).longValue();
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    /** Kết quả export: danh sách payload + cursor cho lần pull sau. */
    public record ExportResult(List<Map<String, Object>> data, String cursor) {
    }
}
