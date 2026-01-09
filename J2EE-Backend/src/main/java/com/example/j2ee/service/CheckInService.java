package com.example.j2ee.service;

import com.example.j2ee.dto.CheckInRequest;
import com.example.j2ee.dto.CheckInResponse;
import com.example.j2ee.model.*;
import com.example.j2ee.repository.DatChoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;

@Service
public class CheckInService {
    
    private static final Logger logger = LoggerFactory.getLogger(CheckInService.class);
    
    @Autowired
    private DatChoRepository datChoRepository;
    
    /**
     * Tìm kiếm thông tin đặt chỗ để check-in
     */
    public CheckInResponse searchBooking(CheckInRequest request) {
        try {
            logger.info("Searching booking with code: {} and name: {}", request.getMaDatCho(), request.getHoVaTen());
            
            // Tìm đặt chỗ theo mã
            DatCho datCho = datChoRepository.findByMaDatCho(request.getMaDatCho());
            
            if (datCho == null) {
                return new CheckInResponse(false, "Không tìm thấy mã đặt chỗ này", null);
            }
            
            // Kiểm tra họ tên
            HanhKhach hanhKhach = datCho.getHanhKhach();
            if (hanhKhach == null) {
                return new CheckInResponse(false, "Thông tin hành khách không tồn tại", null);
            }
            
            String tenHanhKhach = hanhKhach.getHoVaTen().toLowerCase().trim();
            String tenNhap = request.getHoVaTen().toLowerCase().trim();
            
            // Kiểm tra họ (chỉ cần họ khớp)
            if (!tenHanhKhach.contains(tenNhap)) {
                return new CheckInResponse(false, "Họ tên không khớp với mã đặt chỗ", null);
            }
            
            // Lấy thông tin ghế và chuyến bay
            ChiTietGhe chiTietGhe = datCho.getChiTietGhe();
            if (chiTietGhe == null) {
                return new CheckInResponse(false, "Thông tin ghế không tồn tại", null);
            }
            
            ChiTietChuyenBay chuyenBay = chiTietGhe.getChiTietChuyenBay();
            if (chuyenBay == null) {
                return new CheckInResponse(false, "Thông tin chuyến bay không tồn tại", null);
            }
            
            // Kiểm tra trạng thái chuyến bay
            if (!"Đang mở bán".equals(chuyenBay.getTrangThai())) {
                return new CheckInResponse(false, "Chuyến bay không còn mở check-in (Trạng thái: " + chuyenBay.getTrangThai() + ")", null);
            }
            
            // Kiểm tra thời gian check-in
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime ngayGioDi = LocalDateTime.of(chuyenBay.getNgayDi(), chuyenBay.getGioDi());
            long diffHours = java.time.Duration.between(now, ngayGioDi).toHours();
            
            if (diffHours < 0) {
                return new CheckInResponse(false, "Chuyến bay đã khởi hành", null);
            }
            
            // Ghi chú: Chỉ kiểm tra nếu muốn giới hạn thời gian check-in
            // Tạm thời cho phép check-in bất kỳ lúc nào trước giờ bay
            // if (diffHours > 24) {
            //     return new CheckInResponse(false, "Chỉ có thể check-in trong vòng 24 giờ trước giờ bay", null);
            // }
            
            // Kiểm tra trạng thái thanh toán
            TrangThaiThanhToan thanhToan = datCho.getTrangThaiThanhToan();
            boolean daThanhToan = false;
            Double soTien = null;
            
            if (thanhToan != null) {
                // daThanhToan là kiểu char, so sánh với 'Y'
                daThanhToan = thanhToan.getDaThanhToan() == 'Y';
                soTien = thanhToan.getSoTien().doubleValue();
                
                if (!daThanhToan) {
                    return new CheckInResponse(false, "Vui lòng hoàn tất thanh toán trước khi check-in", null);
                }
            } else {
                return new CheckInResponse(false, "Không tìm thấy thông tin thanh toán", null);
            }
            
            // Lấy thông tin tuyến bay
            TuyenBay tuyenBay = chuyenBay.getTuyenBay();
            SanBay sanBayDi = tuyenBay.getSanBayDi();
            SanBay sanBayDen = tuyenBay.getSanBayDen();
            
            // Lấy hạng vé
            HangVe hangVe = chiTietGhe.getHangVe();
            
            // Format time
            DateTimeFormatter timeFormat = DateTimeFormatter.ofPattern("HH:mm");
            String gioDi = chuyenBay.getGioDi().format(timeFormat);
            String gioDen = chuyenBay.getGioDen().format(timeFormat);
            
            // Tạo response
            CheckInResponse.BookingInfo bookingInfo = new CheckInResponse.BookingInfo();
            bookingInfo.setMaDatCho(datCho.getMaDatCho());
            bookingInfo.setNgayDatCho(datCho.getNgayDatCho());
            
            // Hành khách
            bookingInfo.setHoVaTen(hanhKhach.getHoVaTen());
            bookingInfo.setEmail(hanhKhach.getEmail());
            bookingInfo.setSoDienThoai(hanhKhach.getSoDienThoai());
            bookingInfo.setNgaySinh(hanhKhach.getNgaySinh());
            bookingInfo.setGioiTinh(hanhKhach.getGioiTinh());
            
            // Chuyến bay - Convert LocalDate to Date
            bookingInfo.setSoHieuChuyenBay(chuyenBay.getSoHieuChuyenBay());
            bookingInfo.setNgayDi(Date.from(chuyenBay.getNgayDi().atStartOfDay(ZoneId.systemDefault()).toInstant()));
            bookingInfo.setGioDi(gioDi);
            bookingInfo.setNgayDen(Date.from(chuyenBay.getNgayDen().atStartOfDay(ZoneId.systemDefault()).toInstant()));
            bookingInfo.setGioDen(gioDen);
            bookingInfo.setTenSanBayDi(sanBayDi.getTenSanBay());
            bookingInfo.setMaSanBayDi(sanBayDi.getMaIATA());
            bookingInfo.setTenSanBayDen(sanBayDen.getTenSanBay());
            bookingInfo.setMaSanBayDen(sanBayDen.getMaIATA());
            
            // Ghế
            bookingInfo.setMaGhe(chiTietGhe.getMaGhe());
            bookingInfo.setTenHangVe(hangVe.getTenHangVe());
            
            // Thanh toán
            bookingInfo.setDaThanhToan(daThanhToan);
            bookingInfo.setSoTien(soTien);
            
            // Check-in status - lấy từ DB
            bookingInfo.setDaCheckIn(datCho.isCheckInStatus());
            
            return new CheckInResponse(true, "Tìm thấy thông tin đặt chỗ", bookingInfo);
            
        } catch (Exception e) {
            logger.error("Error searching booking: ", e);
            return new CheckInResponse(false, "Lỗi hệ thống: " + e.getMessage(), null);
        }
    }
    
    /**
     * Xác nhận check-in và lưu trạng thái vào DB
     */
    public CheckInResponse confirmCheckIn(int maDatCho) {
        try {
            DatCho datCho = datChoRepository.findByMaDatCho(maDatCho);
            
            if (datCho == null) {
                return new CheckInResponse(false, "Không tìm thấy mã đặt chỗ", null);
            }
            
            // Kiểm tra đã check-in chưa
            if (datCho.isCheckInStatus()) {
                return new CheckInResponse(false, "Mã đặt chỗ này đã được check-in trước đó", null);
            }
            
            // Cập nhật trạng thái check-in
            datCho.setCheckInStatus(true);
            datCho.setCheckInTime(new java.util.Date());
            datChoRepository.save(datCho);
            
            logger.info("Check-in confirmed for booking: {}", maDatCho);
            return new CheckInResponse(true, "Check-in thành công! Vui lòng đến sân bay trước 90 phút.", null);
            
        } catch (Exception e) {
            logger.error("Error confirming check-in: ", e);
            return new CheckInResponse(false, "Lỗi xác nhận check-in: " + e.getMessage(), null);
        }
    }
}
