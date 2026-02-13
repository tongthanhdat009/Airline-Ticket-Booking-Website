package com.example.j2ee.service;

import com.example.j2ee.dto.datcho.CreateBookingRequest;
import com.example.j2ee.dto.datcho.CreateBookingResponse;
import com.example.j2ee.model.*;
import com.example.j2ee.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Service xử lý đặt vé với Transaction và chống Race Condition
 * Yêu cầu:
 * 1. Sử dụng @Transactional để đảm bảo dữ liệu nhất quán
 * 2. Chống trùng ghế bằng UNIQUE KEY (machuyenbay, maghe) trong bảng ghe_da_dat
 * 3. Khi tạo đơn hàng: Insert vào 3 bảng donhang -> hanhkhach -> datcho
 * 4. Nếu bất kỳ bước nào lỗi, rollback toàn bộ
 */
@Service
@RequiredArgsConstructor
public class BookingService {

    private final DonHangRepository donHangRepository;
    private final HanhKhachRepository hanhKhachRepository;
    private final DatChoRepository datChoRepository;
    private final ChiTietGheRepository chiTietGheRepository;
    private final TrangThaiThanhToanRepository trangThaiThanhToanRepository;
    private final GheDaDatRepository gheDaDatRepository;
    private final GiaChuyenBayRepository giaChuyenBayRepository;
    private final ChiTietChuyenBayRepository chiTietChuyenBayRepository;

    /**
     * Tạo đặt vé mới với Transaction hoàn chỉnh
     * Sử dụng @Transactional để rollback nếu có lỗi bất kỳ
     */
    @Transactional
    public CreateBookingResponse createBooking(CreateBookingRequest request) throws Exception {
        // Validate input
        if (request.getPassengerInfo() == null || request.getPassengerInfo().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng cung cấp thông tin hành khách");
        }
        
        if (request.getFlightInfo() == null || request.getFlightInfo().getOutbound() == null) {
            throw new IllegalArgumentException("Vui lòng cung cấp thông tin chuyến bay");
        }

        // Get list of seats from outbound flight
        CreateBookingRequest.FlightDetail outboundDetail = request.getFlightInfo().getOutbound();
        List<Integer> danhSachMaGhe = getSeatList(outboundDetail);
        if (danhSachMaGhe.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn ghế cho chuyến bay");
        }
        
        // Validate: number of seats must match number of passengers
        if (danhSachMaGhe.size() != request.getPassengerInfo().size()) {
            throw new IllegalArgumentException("Số lượng ghế (" + danhSachMaGhe.size() + ") phải bằng số lượng hành khách (" + request.getPassengerInfo().size() + ")");
        }

        // Get chuyến bay
        ChiTietChuyenBay chuyenBayDi = chiTietChuyenBayRepository.findById(outboundDetail.getMaChuyenBay())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chuyến bay"));

        // Bước 1: Kiểm tra và ghim ghế (CHỐNG RACE CONDITION)
        // Đây là chốt chặn cuối cùng - nếu ghế đã bị đặt, sẽ throw exception và rollback toàn bộ
        List<ChiTietGhe> danhSachGhe = lockAndValidateSeats(danhSachMaGhe, outboundDetail.getMaChuyenBay());

        // Bước 2: Tìm hoặc tạo khách hàng
        List<HanhKhach> danhSachHanhKhach = new ArrayList<>();
        for (CreateBookingRequest.PassengerInfo passengerInfo : request.getPassengerInfo()) {
            HanhKhach hanhKhach = findOrCreatePassenger(passengerInfo);
            if (!danhSachHanhKhach.contains(hanhKhach)) {
                danhSachHanhKhach.add(hanhKhach);
            }
        }

        // Bước 3: Tạo đơn hàng
        DonHang donHang = createDonHang(request, danhSachHanhKhach.get(0));

        // Bước 4: Tạo đặt chỗ cho từng hành khách
        List<Integer> danhSachMaDatCho = new ArrayList<>();
        List<Integer> danhSachMaHanhKhach = new ArrayList<>();
        LocalDateTime ngayDatCho = LocalDateTime.now();
        
        for (int i = 0; i < request.getPassengerInfo().size(); i++) {
            HanhKhach hanhKhach = danhSachHanhKhach.get(i);
            ChiTietGhe ghe = danhSachGhe.get(i);
            
            if (!danhSachMaHanhKhach.contains(hanhKhach.getMaHanhKhach())) {
                danhSachMaHanhKhach.add(hanhKhach.getMaHanhKhach());
            }
            
            // Tạo đặt chỗ
            DatCho datCho = createDatCho(donHang, hanhKhach, ghe, chuyenBayDi, ngayDatCho);
            danhSachMaDatCho.add(datCho.getMaDatCho());
        }

        // Bước 5: Xử lý chiều về (nếu có)
        if (request.getFlightInfo().getReturnFlight() != null) {
            processReturnFlight(request, donHang, danhSachHanhKhach, ngayDatCho, danhSachMaDatCho);
        }

        // Bước 6: Tạo thông tin thanh toán (gắn với đơn hàng)
        TrangThaiThanhToan thanhToan = createThanhToan(
            donHang,
            request.getTotalAmount()
        );

        // Bước 7: Tạo response
        CreateBookingResponse response = new CreateBookingResponse();
        response.setMaDatCho(danhSachMaDatCho.get(0));
        response.setMaThanhToan(thanhToan.getMaThanhToan());
        response.setMaHanhKhach(danhSachMaHanhKhach.get(0));
        response.setDanhSachMaDatCho(danhSachMaDatCho);
        response.setDanhSachMaHanhKhach(danhSachMaHanhKhach);

        return response;
    }

    /**
     * Ghim và validate các ghế đã chọn
     * Chống race condition bằng cách kiểm tra ghe_da_dat
     */
    private List<ChiTietGhe> lockAndValidateSeats(List<Integer> danhSachMaGhe, int maChuyenBay) {
        List<ChiTietGhe> danhSachGhe = new ArrayList<>();
        
        // Lấy thông tin chuyến bay để biết máy bay
        ChiTietChuyenBay chuyenBay = chiTietChuyenBayRepository.findById(maChuyenBay)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chuyến bay với mã: " + maChuyenBay));
        
        int maMayBay = chuyenBay.getMayBay().getMaMayBay();
        
        for (Integer maGhe : danhSachMaGhe) {
            // Lấy thông tin ghế
            ChiTietGhe ghe = chiTietGheRepository.findById(maGhe)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ghế với mã: " + maGhe));
            
            // Kiểm tra ghế có thuộc máy bay của chuyến bay không
            if (ghe.getMayBay() == null || ghe.getMayBay().getMaMayBay() != maMayBay) {
                throw new IllegalArgumentException("Ghế " + maGhe + " không thuộc máy bay của chuyến bay này");
            }
            
            // CHỐNG RACE CONDITION - Kiểm tra ghế đã được đặt chưa trong chuyến bay này
            if (gheDaDatRepository.existsByChuyenBay_MaChuyenBayAndGhe_MaGhe(maChuyenBay, maGhe)) {
                throw new IllegalArgumentException("Ghế " + maGhe + " đã có người khác nhanh tay đặt mất, vui lòng chọn ghế khác");
            }
            
            danhSachGhe.add(ghe);
        }
        
        return danhSachGhe;
    }

    /**
     * Tìm hoặc tạo khách hàng mới
     */
    private HanhKhach findOrCreatePassenger(CreateBookingRequest.PassengerInfo passengerInfo) {
        HanhKhach hanhKhach = null;
        
        // Tìm bằng email
        HanhKhach hanhKhachByEmail = hanhKhachRepository.findByEmail(passengerInfo.getEmail()).orElse(null);
        
        // Tìm bằng số điện thoại
        HanhKhach hanhKhachByPhone = hanhKhachRepository.findBySoDienThoai(passengerInfo.getPhone()).orElse(null);
        
        if (hanhKhachByEmail != null) {
            hanhKhach = hanhKhachByEmail;
            updatePassengerInfo(hanhKhach, passengerInfo, hanhKhachByPhone);
        } else if (hanhKhachByPhone != null) {
            hanhKhach = hanhKhachByPhone;
            updatePassengerInfo(hanhKhach, passengerInfo, null);
        } else {
            hanhKhach = createNewPassenger(passengerInfo);
        }
        
        return hanhKhachRepository.save(hanhKhach);
    }

    private void updatePassengerInfo(HanhKhach hanhKhach, CreateBookingRequest.PassengerInfo passengerInfo, HanhKhach hanhKhachByPhone) {
        hanhKhach.setHoVaTen(passengerInfo.getFullName());
        hanhKhach.setGioiTinh(passengerInfo.getGender());
        hanhKhach.setMaDinhDanh(passengerInfo.getIdNumber());
        
        if (!passengerInfo.getPhone().equals(hanhKhach.getSoDienThoai())) {
            if (hanhKhachByPhone == null || hanhKhachByPhone.getMaHanhKhach() == hanhKhach.getMaHanhKhach()) {
                hanhKhach.setSoDienThoai(passengerInfo.getPhone());
            }
        }
        
        if (passengerInfo.getBirthDate() != null && !passengerInfo.getBirthDate().isEmpty()) {
            try {
                hanhKhach.setNgaySinh(java.sql.Date.valueOf(passengerInfo.getBirthDate()));
            } catch (Exception e) {
                // Ignore date parsing error
            }
        }
    }

    private HanhKhach createNewPassenger(CreateBookingRequest.PassengerInfo passengerInfo) {
        HanhKhach hanhKhach = new HanhKhach();
        hanhKhach.setHoVaTen(passengerInfo.getFullName());
        hanhKhach.setEmail(passengerInfo.getEmail());
        hanhKhach.setSoDienThoai(passengerInfo.getPhone());
        hanhKhach.setGioiTinh(passengerInfo.getGender());
        hanhKhach.setMaDinhDanh(passengerInfo.getIdNumber());
        
        if (passengerInfo.getBirthDate() != null && !passengerInfo.getBirthDate().isEmpty()) {
            try {
                hanhKhach.setNgaySinh(java.sql.Date.valueOf(passengerInfo.getBirthDate()));
            } catch (Exception e) {
                // Ignore date parsing error
            }
        }
        
        return hanhKhach;
    }

    /**
     * Tạo đơn hàng mới
     */
    private DonHang createDonHang(CreateBookingRequest request, HanhKhach hanhKhachNguoiDat) {
        DonHang donHang = new DonHang();
        donHang.setPnr(generatePNR());
        donHang.setHanhKhachNguoiDat(hanhKhachNguoiDat);
        donHang.setNgayDat(LocalDateTime.now());
        donHang.setTongGia(request.getTotalAmount());
        donHang.setTrangThai("CHỜ THANH TOÁN");
        donHang.setEmailNguoiDat(hanhKhachNguoiDat.getEmail());
        donHang.setSoDienThoaiNguoiDat(hanhKhachNguoiDat.getSoDienThoai());
        donHang.setGhiChu("");
        
        return donHangRepository.save(donHang);
    }

    /**
     * Tạo đặt chỗ
     */
    private DatCho createDatCho(DonHang donHang, HanhKhach hanhKhach, ChiTietGhe ghe, 
                                ChiTietChuyenBay chuyenBay, LocalDateTime ngayDatCho) {
        DatCho datCho = new DatCho();
        datCho.setDonHang(donHang);
        datCho.setHanhKhach(hanhKhach);
        datCho.setChiTietGhe(ghe);
        datCho.setChuyenBay(chuyenBay);
        datCho.setHangVe(ghe.getHangVe());
        datCho.setNgayDatCho(ngayDatCho);
        datCho.setTrangThai("ACTIVE");
        datCho.setCheckInStatus(false);
        
        // Tính giá vé
        BigDecimal giaVe = calculateGiaVe(chuyenBay.getMaChuyenBay(), ghe.getHangVe().getMaHangVe());
        datCho.setGiaVe(giaVe);
        
        DatCho savedDatCho = datChoRepository.save(datCho);
        
        // Tạo GheDaDat sau khi DatCho đã được lưu (để có maDatCho)
        // Đây là bước chính thức ghi nhận ghế đã được đặt
        createGheDaDat(chuyenBay, ghe, savedDatCho);
        
        return savedDatCho;
    }

    /**
     * Tạo GheDaDat - Chốt chặn cuối cùng để chống trùng ghế
     * UNIQUE KEY (machuyenbay, maghe) sẽ đảm bảo không 2 người đặt cùng 1 ghế
     */
    private void createGheDaDat(ChiTietChuyenBay chuyenBay, ChiTietGhe ghe, DatCho datCho) {
        GheDaDat gheDaDat = new GheDaDat();
        gheDaDat.setChuyenBay(chuyenBay);
        gheDaDat.setGhe(ghe);
        gheDaDat.setDatCho(datCho);
        gheDaDat.setThoiGianDat(LocalDateTime.now());
        
        try {
            gheDaDatRepository.save(gheDaDat);
        } catch (Exception e) {
            // Nếu có lỗi (ví dụ: Duplicate Key), throw exception để rollback
            throw new RuntimeException("Ghế " + ghe.getMaGhe() + " đã được đặt bởi người khác");
        }
    }

    /**
     * Tính giá vé
     */
    private BigDecimal calculateGiaVe(int maChuyenBay, int maHangVe) {
        // Tìm chuyến bay để lấy tuyến bay
        ChiTietChuyenBay chuyenBay = chiTietChuyenBayRepository.findById(maChuyenBay)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chuyến bay"));

        if(chuyenBay.getTuyenBay() == null) {
            throw new IllegalArgumentException("Chuyến bay không có tuyến bay");
        }

        // Dùng repository method để tìm giá
        GiaChuyenBay giaChuyenBay = giaChuyenBayRepository
            .findLatestGiaByHangVeAndChuyenBay((long) maChuyenBay, (long) maHangVe);
        
        if (giaChuyenBay == null) {
            throw new IllegalArgumentException("Không tìm thấy giá vé cho chuyến bay và hạng vé này");
        }
        
        return giaChuyenBay.getGiaVe();
    }

    /**
     * Xử lý chuyến bay chiều về
     */
    private void processReturnFlight(CreateBookingRequest request, DonHang donHang, 
                                   List<HanhKhach> danhSachHanhKhach, LocalDateTime ngayDatCho,
                                   List<Integer> danhSachMaDatCho) {
        CreateBookingRequest.FlightDetail returnFlight = request.getFlightInfo().getReturnFlight();
        
        // Get return flight seats
        List<Integer> danhSachMaGheVe = getSeatList(returnFlight);
        
        if (danhSachMaGheVe.size() != request.getPassengerInfo().size()) {
            throw new IllegalArgumentException("Số lượng ghế chiều về (" + danhSachMaGheVe.size() + ") phải bằng số lượng hành khách (" + request.getPassengerInfo().size() + ")");
        }
        
        // Get chuyến bay về
        ChiTietChuyenBay chuyenBayVe = chiTietChuyenBayRepository.findById(returnFlight.getMaChuyenBay())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chuyến bay chiều về"));
        
        // Lock and validate return seats
        List<ChiTietGhe> danhSachGheVe = lockAndValidateSeats(danhSachMaGheVe, returnFlight.getMaChuyenBay());
        
        // Create return bookings
        for (int i = 0; i < request.getPassengerInfo().size(); i++) {
            HanhKhach hanhKhach = danhSachHanhKhach.get(i);
            ChiTietGhe gheVe = danhSachGheVe.get(i);
            
            DatCho datChoVe = createDatCho(donHang, hanhKhach, gheVe, chuyenBayVe, ngayDatCho);
            danhSachMaDatCho.add(datChoVe.getMaDatCho());
        }
    }

    /**
     * Tạo thông tin thanh toán
     */
    private TrangThaiThanhToan createThanhToan(DonHang donHang, BigDecimal totalAmount) {
        TrangThaiThanhToan thanhToan = new TrangThaiThanhToan();
        thanhToan.setDonHang(donHang);
        thanhToan.setSoTien(totalAmount);
        thanhToan.setDaThanhToan('N');

        // Set expiration time (15 minutes from now)
        LocalDateTime hetHan = LocalDateTime.now().plusMinutes(15);
        thanhToan.setNgayHetHan(java.sql.Date.valueOf(hetHan.toLocalDate()));

        return trangThaiThanhToanRepository.save(thanhToan);
    }

    /**
     * Lấy danh sách mã ghế từ FlightDetail
     */
    private List<Integer> getSeatList(CreateBookingRequest.FlightDetail flightDetail) {
        List<Integer> danhSachMaGhe = new ArrayList<>();
        if (flightDetail.getDanhSachMaGhe() != null && !flightDetail.getDanhSachMaGhe().isEmpty()) {
            danhSachMaGhe = flightDetail.getDanhSachMaGhe();
        } else if (flightDetail.getMaGhe() != null) {
            danhSachMaGhe.add(flightDetail.getMaGhe());
        }
        return danhSachMaGhe;
    }

    /**
     * Generate PNR (Passenger Name Record) - 6 ký tự ngẫu nhiên
     */
    private String generatePNR() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder pnr = new StringBuilder();
        Random random = new Random();
        
        do {
            pnr.setLength(0);
            for (int i = 0; i < 6; i++) {
                pnr.append(chars.charAt(random.nextInt(chars.length())));
            }
        } while (donHangRepository.existsByPnr(pnr.toString()));
        
        return pnr.toString();
    }
}
