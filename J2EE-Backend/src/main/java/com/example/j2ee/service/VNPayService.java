package com.example.j2ee.service;

import com.example.j2ee.annotation.Auditable;
import com.example.j2ee.config.VNPayConfig;
import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.DonHang;
import com.example.j2ee.model.HoaDon;
import com.example.j2ee.model.TrangThaiThanhToan;
import com.example.j2ee.repository.DatChoRepository;
import com.example.j2ee.repository.DonHangRepository;
import com.example.j2ee.repository.TrangThaiThanhToanRepository;
import com.example.j2ee.util.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VNPayService {

    private final VNPayConfig vnPayConfig;
    private final TrangThaiThanhToanRepository trangThaiThanhToanRepository;
    private final DatChoRepository datChoRepository;
    private final JasperTicketService jasperTicketService;
    private final EmailService emailService;
    private final DonHangService donHangService;
    private final DonHangRepository donHangRepository;

    /**
     * Lấy frontend URL
     */
    public String getFrontendUrl() {
        return vnPayConfig.getFrontendUrl();
    }

    /**
     * Tạo URL thanh toán VNPay
     */
    public String createPaymentUrl(int maThanhToan, HttpServletRequest request) throws UnsupportedEncodingException {
        // Lấy thông tin thanh toán
        TrangThaiThanhToan thanhToan = trangThaiThanhToanRepository.findById(maThanhToan)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin thanh toán"));

        if (thanhToan.getDaThanhToan() == 'Y') {
            throw new IllegalArgumentException("Giao dịch này đã được thanh toán");
        }

        if (thanhToan.getDaThanhToan() == 'H') {
            throw new IllegalArgumentException("Giao dịch này đã bị hủy");
        }

        // Số tiền (VNPay yêu cầu nhân 100)
        long amount = thanhToan.getSoTien().multiply(new BigDecimal("100")).longValue();

        // Tạo dữ liệu thanh toán
        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", VNPayConfig.VERSION);
        vnpParams.put("vnp_Command", VNPayConfig.COMMAND);
        vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", VNPayConfig.CURRENCY_CODE);

        // Sử dụng maThanhToan làm txnRef để VNPay trả về
        String txnRef = "MAT" + maThanhToan + "_" + System.currentTimeMillis();
        vnpParams.put("vnp_TxnRef", txnRef);
        vnpParams.put("vnp_OrderInfo", "Thanh toan ve may bay - Ma thanh toan: " + maThanhToan);
        vnpParams.put("vnp_OrderType", VNPayConfig.ORDER_TYPE);
        vnpParams.put("vnp_Locale", VNPayConfig.LOCALE);

        // Return URL sẽ redirect về frontend với maThanhToan
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnpParams.put("vnp_IpAddr", VNPayUtil.getIpAddress(request));

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreateDate = formatter.format(cld.getTime());
        vnpParams.put("vnp_CreateDate", vnpCreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnpExpireDate = formatter.format(cld.getTime());
        vnpParams.put("vnp_ExpireDate", vnpExpireDate);

        // Sắp xếp params và tạo query string
        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnpParams.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnpSecureHash = VNPayUtil.hmacSHA512(vnPayConfig.getSecretKey(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;

        return vnPayConfig.getPayUrl() + "?" + queryUrl;
    }

    /**
     * Xử lý kết quả trả về từ VNPay
     * Bước 7a: Verify chữ ký VNPay
     * Bước 7b: Update trangthaithanhtoan
     * Bước 7c: Update donhang.trangThai
     * Bước 7d: Tạo hoadon
     * Bước 7e: Gửi email xác nhận
     */
    @Auditable(action = "THANH_TOÁN_VNPAY", table = "trangthaithanhtoan",
               description = "Xử lý kết quả thanh toán VNPay", accountType = "CUSTOMER")
    @CacheEvict(value = { "thongKeTongQuan", "doanhThuTheoNgay", "thongKeNgay" }, allEntries = true)
    @Transactional
    public Map<String, Object> handlePaymentReturn(Map<String, String> params) {
        Map<String, Object> result = new HashMap<>();

        try {
            String responseCode = params.get("vnp_ResponseCode");
            String txnRef = params.get("vnp_TxnRef");
            String vnpSecureHash = params.get("vnp_SecureHash");
            String vnpTransactionNo = params.get("vnp_TransactionNo");

            // Bước 7a: Verify chữ ký VNPay
            Map<String, String> vnpParams = new HashMap<>(params);
            vnpParams.remove("vnp_SecureHash");
            vnpParams.remove("vnp_SecureHashType");

            String calculatedHash = VNPayUtil.hashAllFields(vnpParams, vnPayConfig.getSecretKey());
            if (!calculatedHash.equals(vnpSecureHash)) {
                result.put("success", false);
                result.put("message", "Chữ ký không hợp lệ");
                result.put("data", null);
                return result;
            }

            // Trích xuất maThanhToan từ txnRef (format: MAT{maThanhToan}_{timestamp})
            int maThanhToan;
            try {
                String[] parts = txnRef.split("_");
                maThanhToan = Integer.parseInt(parts[0].substring(3)); // Bỏ "MAT" prefix
            } catch (Exception e) {
                throw new IllegalArgumentException("Mã giao dịch không hợp lệ");
            }

            TrangThaiThanhToan thanhToan = trangThaiThanhToanRepository.findById(maThanhToan)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin thanh toán"));

            DonHang donHang = thanhToan.getDonHang();
            if (donHang == null) {
                throw new IllegalArgumentException("Không tìm thấy đơn hàng liên quan đến thanh toán");
            }

            if ("00".equals(responseCode)) {
                // Bước 7b: Update trangthaithanhtoan
                thanhToan.setDaThanhToan('Y');
                thanhToan.setPhuongThucThanhToan("VNPAY");
                thanhToan.setTrangThai("COMPLETED");
                thanhToan.setTransactionCode(vnpTransactionNo);
                thanhToan.setThoigianThanhToan(LocalDateTime.now());
                trangThaiThanhToanRepository.save(thanhToan);

                // Bước 7c: Update donhang.trangThai
                donHang.setTrangThai("ĐÃ THANH TOÁN");
                donHangRepository.save(donHang);

                // Bước 7d: Tạo hoadon
                try {
                    HoaDon hoaDon = donHangService.taoHoaDon(donHang);
                    System.out.println("Đã tạo hóa đơn: " + hoaDon.getSoHoaDon());
                } catch (Exception e) {
                    System.err.println("Failed to create invoice: " + e.getMessage());
                }

                // Bước 7e: Gửi email xác nhận
                try {
                    sendTicketConfirmationEmail(thanhToan);
                } catch (Exception e) {
                    // Log error but don't fail the payment process
                    System.err.println("Failed to send ticket email: " + e.getMessage());
                }

                result.put("success", true);
                result.put("message", "Thanh toán thành công");
                result.put("data", thanhToan);
            } else {
                // Thanh toán thất bại
                thanhToan.setTrangThai("FAILED");
                trangThaiThanhToanRepository.save(thanhToan);

                result.put("success", false);
                result.put("message", "Thanh toán thất bại. Mã lỗi: " + responseCode);
                result.put("data", null);
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Lỗi xử lý kết quả thanh toán: " + e.getMessage());
            result.put("data", null);
        }

        return result;
    }

    /**
     * Generate ticket PDF and send confirmation email to ALL passengers in the
     * group booking.
     * For round-trip bookings, sends 1 email with BOTH PDFs attached (outbound +
     * return).
     * For one-way bookings, sends 1 email with 1 PDF.
     * Formula: 1 email per passenger (containing all their flight tickets).
     */
    private void sendTicketConfirmationEmail(TrangThaiThanhToan thanhToan) throws Exception {
        if (thanhToan.getDonHang() == null || thanhToan.getDonHang().getDanhSachDatCho() == null
                || thanhToan.getDonHang().getDanhSachDatCho().isEmpty()) {
            System.err.println("No booking associated with payment: " + thanhToan.getMaThanhToan());
            return;
        }

        // Lấy tất cả bookings từ đơn hàng trực tiếp (KHÔNG dùng time window)
        List<DatCho> allBookings = new ArrayList<>(thanhToan.getDonHang().getDanhSachDatCho());
        System.out.println("Found " + allBookings.size() + " bookings for order");

        // Group bookings by passenger (same email and name)
        Map<String, List<DatCho>> bookingsByPassenger = new HashMap<>();

        for (DatCho booking : allBookings) {
            if (booking.getHanhKhach() != null) {
                String passengerKey = booking.getHanhKhach().getEmail() + "_" +
                        booking.getHanhKhach().getHoVaTen();
                bookingsByPassenger.computeIfAbsent(passengerKey, k -> new ArrayList<>()).add(booking);
            }
        }

        int totalEmailsSent = 0;
        int totalEmailsFailed = 0;

        // Process each passenger's bookings - send 1 email per passenger with all their
        // tickets
        for (Map.Entry<String, List<DatCho>> entry : bookingsByPassenger.entrySet()) {
            List<DatCho> passengerBookings = entry.getValue();

            // Sort bookings by flight date to ensure correct order (outbound first, then
            // return)
            passengerBookings.sort((b1, b2) -> {
                LocalDate d1 = b1.getChuyenBay() != null ? b1.getChuyenBay().getNgayDi() : LocalDate.MIN;
                LocalDate d2 = b2.getChuyenBay() != null ? b2.getChuyenBay().getNgayDi() : LocalDate.MIN;
                return d1.compareTo(d2);
            });

            // Determine if round-trip: passenger has 2+ bookings
            boolean isRoundTrip = passengerBookings.size() >= 2;

            System.out.println("Processing passenger: " + entry.getKey() +
                    " | Bookings: " + passengerBookings.size() +
                    " | Round-trip: " + isRoundTrip +
                    " | Emails to send: 1");

            try {
                // Get passenger information from first booking
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

                // Generate PDFs for all bookings (flights) of this passenger
                List<byte[]> ticketPdfs = new ArrayList<>();
                List<String> flightInfo = new ArrayList<>();

                for (int i = 0; i < passengerBookings.size(); i++) {
                    DatCho booking = passengerBookings.get(i);

                    // Generate PDF for this flight
                    byte[] ticketPdf = jasperTicketService.generateTicketPdfByBooking(booking.getMaDatCho());
                    ticketPdfs.add(ticketPdf);

                    // Build flight info string
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

                // Prepare summary info for email
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

                // Send ONE email with ALL PDFs attached
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
