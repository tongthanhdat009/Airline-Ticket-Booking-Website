package com.example.j2ee.service;

import com.example.j2ee.annotation.Auditable;
import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.DonHang;
import com.example.j2ee.model.HoaDon;
import com.example.j2ee.model.TrangThaiThanhToan;
import com.example.j2ee.repository.DonHangRepository;
import com.example.j2ee.repository.TrangThaiThanhToanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service xử lý thanh toán thường (nội bộ, không qua cổng thanh toán ngoài).
 * Xác nhận thanh toán ngay: update trangthaithanhtoan -> donhang -> tạo hoadon -> gửi email vé.
 */
@Service
@RequiredArgsConstructor
public class ThanhToanThuongService {

    private final TrangThaiThanhToanRepository trangThaiThanhToanRepository;
    private final DonHangRepository donHangRepository;
    private final JasperTicketService jasperTicketService;
    private final EmailService emailService;
    private final DonHangService donHangService;

    @Auditable(action = "THANH_TOÁN_THƯỜNG", table = "trangthaithanhtoan",
               description = "Xác nhận thanh toán thường", accountType = "CUSTOMER")
    @CacheEvict(value = { "thongKeTongQuan", "doanhThuTheoNgay", "thongKeNgay" }, allEntries = true)
    @Transactional
    public TrangThaiThanhToan xacNhanThanhToan(int maThanhToan) {
        TrangThaiThanhToan thanhToan = trangThaiThanhToanRepository.findById(maThanhToan)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin thanh toán"));

        if (thanhToan.getDaThanhToan() == 'Y') {
            throw new IllegalArgumentException("Giao dịch này đã được thanh toán");
        }

        if (thanhToan.getDaThanhToan() == 'H') {
            throw new IllegalArgumentException("Giao dịch này đã bị hủy");
        }

        DonHang donHang = thanhToan.getDonHang();
        if (donHang == null) {
            throw new IllegalArgumentException("Không tìm thấy đơn hàng liên quan đến thanh toán");
        }

        thanhToan.setDaThanhToan('Y');
        thanhToan.setPhuongThucThanhToan("THUONG");
        thanhToan.setTrangThai("COMPLETED");
        thanhToan.setTransactionCode("THUONG-" + maThanhToan + "-" + System.currentTimeMillis());
        thanhToan.setThoigianThanhToan(LocalDateTime.now());
        trangThaiThanhToanRepository.save(thanhToan);

        donHang.setTrangThai("ĐÃ THANH TOÁN");
        donHangRepository.save(donHang);

        try {
            HoaDon hoaDon = donHangService.taoHoaDon(donHang);
            System.out.println("Đã tạo hóa đơn: " + hoaDon.getSoHoaDon());
        } catch (Exception e) {
            System.err.println("Failed to create invoice: " + e.getMessage());
        }

        try {
            sendTicketConfirmationEmail(thanhToan);
        } catch (Exception e) {
            System.err.println("Failed to send ticket email: " + e.getMessage());
            e.printStackTrace();
        }

        return thanhToan;
    }

    /**
     * Generate ticket PDF and send confirmation email to ALL passengers in the
     * group booking. For round-trip bookings, sends 1 email with BOTH PDFs attached.
     * Formula: 1 email per passenger (containing all their flight tickets).
     */
    private void sendTicketConfirmationEmail(TrangThaiThanhToan thanhToan) throws Exception {
        if (thanhToan.getDonHang() == null || thanhToan.getDonHang().getDanhSachDatCho() == null
                || thanhToan.getDonHang().getDanhSachDatCho().isEmpty()) {
            System.err.println("No booking associated with payment: " + thanhToan.getMaThanhToan());
            return;
        }

        List<DatCho> allBookings = new ArrayList<>(thanhToan.getDonHang().getDanhSachDatCho());
        System.out.println("Found " + allBookings.size() + " bookings for order");

        Map<String, List<DatCho>> bookingsByPassenger = new HashMap<>();

        for (DatCho booking : allBookings) {
            if (booking.getHanhKhach() != null) {
                String passengerKey = booking.getHanhKhach().getEmail() + "_"
                        + booking.getHanhKhach().getHoVaTen();
                bookingsByPassenger.computeIfAbsent(passengerKey, k -> new ArrayList<>()).add(booking);
            }
        }

        int totalEmailsSent = 0;
        int totalEmailsFailed = 0;

        for (Map.Entry<String, List<DatCho>> entry : bookingsByPassenger.entrySet()) {
            List<DatCho> passengerBookings = entry.getValue();

            passengerBookings.sort((b1, b2) -> {
                LocalDate d1 = b1.getChuyenBay() != null ? b1.getChuyenBay().getNgayDi() : LocalDate.MIN;
                LocalDate d2 = b2.getChuyenBay() != null ? b2.getChuyenBay().getNgayDi() : LocalDate.MIN;
                return d1.compareTo(d2);
            });

            boolean isRoundTrip = passengerBookings.size() >= 2;

            System.out.println("Processing passenger: " + entry.getKey() +
                    " | Bookings: " + passengerBookings.size() +
                    " | Round-trip: " + isRoundTrip +
                    " | Emails to send: 1");

            try {
                DatCho firstBooking = passengerBookings.get(0);
                String email = "";
                String passengerName = "";

                if (firstBooking.getHanhKhach() != null) {
                    email = firstBooking.getHanhKhach().getEmail();
                    passengerName = firstBooking.getHanhKhach().getHoVaTen();
                }

                if (email == null || email.isEmpty()) {
                    totalEmailsFailed++;
                    System.err.println("✗ No email found for passenger: " + entry.getKey());
                    continue;
                }

                List<byte[]> ticketPdfs = new ArrayList<>();
                List<String> flightInfo = new ArrayList<>();

                for (int i = 0; i < passengerBookings.size(); i++) {
                    DatCho booking = passengerBookings.get(i);

                    byte[] ticketPdf = jasperTicketService.generateTicketPdfByBooking(booking.getMaDatCho());
                    ticketPdfs.add(ticketPdf);

                    String bookingCode = String.valueOf(booking.getMaDatCho());
                    String flightNumber = "-";
                    String route = "-";
                    String flightType = "";

                    if (isRoundTrip) {
                        flightType = (i == 0 ? " (Chiều đi)" : " (Chiều về)");
                    }

                    if (booking.getChuyenBay() != null) {
                        var flight = booking.getChuyenBay();
                        flightNumber = flight.getSoHieuChuyenBay() + flightType;

                        if (flight.getTuyenBay() != null) {
                            String departure = flight.getTuyenBay().getSanBayDi() != null
                                    ? flight.getTuyenBay().getSanBayDi().getTenSanBay()
                                    : "-";
                            String arrival = flight.getTuyenBay().getSanBayDen() != null
                                    ? flight.getTuyenBay().getSanBayDen().getTenSanBay()
                                    : "-";
                            route = departure + " → " + arrival;
                        }
                    }

                    flightInfo.add("Booking: " + bookingCode + " | Flight: " + flightNumber + " | Route: " + route);
                }

                String bookingCodes = passengerBookings.stream()
                        .map(b -> String.valueOf(b.getMaDatCho()))
                        .reduce((a, b) -> a + ", " + b)
                        .orElse("-");

                String flightNumbers = passengerBookings.stream()
                        .map(b -> {
                            if (b.getChuyenBay() != null) {
                                return b.getChuyenBay().getSoHieuChuyenBay();
                            }
                            return "-";
                        })
                        .reduce((a, b) -> a + ", " + b)
                        .orElse("-");

                String routes = passengerBookings.stream()
                        .map(b -> {
                            if (b.getChuyenBay() != null &&
                                    b.getChuyenBay().getTuyenBay() != null) {
                                var tuyenBay = b.getChuyenBay().getTuyenBay();
                                String dep = tuyenBay.getSanBayDi() != null ? tuyenBay.getSanBayDi().getTenSanBay()
                                        : "-";
                                String arr = tuyenBay.getSanBayDen() != null ? tuyenBay.getSanBayDen().getTenSanBay()
                                        : "-";
                                return dep + " → " + arr;
                            }
                            return "-";
                        })
                        .reduce((a, b) -> a + " | " + b)
                        .orElse("-");

                emailService.sendTicketEmailWithMultiplePdfs(
                        email,
                        passengerName,
                        bookingCodes,
                        flightNumbers,
                        routes,
                        ticketPdfs);

                totalEmailsSent++;
                System.out.println("✓ Sent email with " + ticketPdfs.size() + " ticket(s) to: " + email);
                for (String info : flightInfo) {
                    System.out.println("  - " + info);
                }

            } catch (Exception e) {
                totalEmailsFailed++;
                System.err.println("✗ Failed to send ticket to passenger " + entry.getKey() +
                        ": " + e.getMessage());
                e.printStackTrace();
            }
        }

        System.out.println("=== Email Summary ===");
        System.out.println("Total passengers: " + bookingsByPassenger.size());
        System.out.println("Total emails sent: " + totalEmailsSent);
        System.out.println("Total emails failed: " + totalEmailsFailed);
        System.out.println("====================");
    }
}
