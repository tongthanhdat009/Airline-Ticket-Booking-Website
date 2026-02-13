package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.dto.datcho.CreateBookingRequest;
import com.example.j2ee.dto.datcho.CreateBookingResponse;
import com.example.j2ee.dto.datcho.DatChoDetailResponse;
import com.example.j2ee.dto.datcho.DatChoSearchRequest;
import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.DonHang;
import com.example.j2ee.model.HanhKhach;
import com.example.j2ee.model.ChiTietGhe;
import com.example.j2ee.model.TrangThaiThanhToan;
import com.example.j2ee.repository.DatChoRepository;
import com.example.j2ee.repository.DonHangRepository;
import com.example.j2ee.repository.HanhKhachRepository;
import com.example.j2ee.repository.ChiTietGheRepository;
import com.example.j2ee.repository.TrangThaiThanhToanRepository;
import com.example.j2ee.repository.GheDaDatRepository;
import com.example.j2ee.service.DatChoService;
import jakarta.validation.Valid;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/client/datcho")
@RequiredArgsConstructor
public class ClientDatChoController {

    private final DatChoService datChoService;
    private final DatChoRepository datChoRepository;
    private final DonHangRepository donHangRepository;
    private final HanhKhachRepository hanhKhachRepository;
    private final ChiTietGheRepository chiTietGheRepository;
    private final TrangThaiThanhToanRepository trangThaiThanhToanRepository;
    private final GheDaDatRepository gheDaDatRepository;

    /**
     * Lấy danh sách đặt chỗ của hành khách theo mã hành khách
     */
    @GetMapping("/hanhkhach/{maHanhKhach}")
    public ResponseEntity<ApiResponse<List<DatCho>>> getDatChoByHanhKhach(@PathVariable int maHanhKhach) {
        try {
            List<DatCho> danhSachDatCho = datChoService.getDatChoByHanhKhach(maHanhKhach);
            return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách đặt chỗ thành công", danhSachDatCho)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi lấy danh sách đặt chỗ: " + e.getMessage()));
        }
    }

    /**
     * Lấy chi tiết đặt chỗ theo mã đặt chỗ
     */
    @GetMapping("/{maDatCho}")
    public ResponseEntity<ApiResponse<DatCho>> getDatChoById(@PathVariable int maDatCho) {
        try {
            DatCho datCho = datChoService.getDatChoById(maDatCho)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đặt chỗ"));
            
            return ResponseEntity.ok(
                ApiResponse.success("Lấy chi tiết đặt chỗ thành công", datCho)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi lấy chi tiết đặt chỗ: " + e.getMessage()));
        }
    }

    /**
     * Hủy đặt chỗ (xóa đặt chỗ và các giao dịch liên quan)
     */
    @DeleteMapping("/{maDatCho}")
    public ResponseEntity<ApiResponse<Void>> huyDatCho(@PathVariable int maDatCho) {
        try {
            datChoService.huyDatCho(maDatCho);
            return ResponseEntity.ok(ApiResponse.successMessage("Hủy đặt chỗ thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi hủy đặt chỗ: " + e.getMessage()));
        }
    }

    /**
     * Tìm kiếm đặt chỗ theo mã đặt chỗ và tên hành khách
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<DatChoDetailResponse>> searchDatCho(
            @Valid @ModelAttribute DatChoSearchRequest request) {
        try {
            DatChoDetailResponse response = datChoService.searchDatCho(
                request.getMaDatCho(), 
                request.getTenHanhKhach()
            );
            
            return ResponseEntity.ok(
                ApiResponse.success("Tìm kiếm thành công", response)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi tìm kiếm: " + e.getMessage()));
        }
    }

    /**
     * Tạo đặt chỗ mới với thông tin hành khách và thanh toán
     * Hỗ trợ đặt cho nhiều hành khách cùng lúc
     * @Transactional: Đảm bảo dữ liệu nhất quán, rollback nếu có lỗi
     */
    @PostMapping("/create")
    @Transactional
    public ResponseEntity<ApiResponse<CreateBookingResponse>> createBooking(
            @Valid @RequestBody CreateBookingRequest request) {
        // Validate input BEFORE starting transaction
        if (request.getPassengerInfo() == null || request.getPassengerInfo().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Vui lòng cung cấp thông tin hành khách"));
        }
        
        if (request.getFlightInfo() == null || request.getFlightInfo().getOutbound() == null) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Vui lòng cung cấp thông tin chuyến bay"));
        }

        try {
            // Get list of seats (support both single seat and multiple seats)
            List<Integer> danhSachMaGhe = new ArrayList<>();
            if (request.getFlightInfo().getOutbound().getDanhSachMaGhe() != null 
                && !request.getFlightInfo().getOutbound().getDanhSachMaGhe().isEmpty()) {
                danhSachMaGhe = request.getFlightInfo().getOutbound().getDanhSachMaGhe();
            } else if (request.getFlightInfo().getOutbound().getMaGhe() != null) {
                // Backward compatibility: single seat
                danhSachMaGhe.add(request.getFlightInfo().getOutbound().getMaGhe());
            } else {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Vui lòng chọn ghế cho chuyến bay"));
            }
            
            // Debug log
            System.out.println("DEBUG: Số ghế được chọn = " + danhSachMaGhe.size() + ", danh sách: " + danhSachMaGhe);
            System.out.println("DEBUG: Số hành khách = " + request.getPassengerInfo().size());
            
            // Validate: number of seats must match number of passengers
            if (danhSachMaGhe.size() != request.getPassengerInfo().size()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Số lượng ghế (" + danhSachMaGhe.size() + ") phải bằng số lượng hành khách (" + request.getPassengerInfo().size() + ")"));
            }
            
            // Validate all seats exist and are available
            List<ChiTietGhe> danhSachGhe = new ArrayList<>();
            for (Integer maGhe : danhSachMaGhe) {
                ChiTietGhe ghe = chiTietGheRepository.findById(maGhe).orElse(null);
                if (ghe == null) {
                    return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Không tìm thấy ghế với mã: " + maGhe));
                }
                
                // CHỐNG RACE CONDITION: Kiểm tra ghế đã được đặt chưa qua GheDaDat
                if (gheDaDatRepository.existsByChuyenBay_MaChuyenBayAndGhe_MaGhe(
                        request.getFlightInfo().getOutbound().getMaChuyenBay(), maGhe)) {
                    return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Ghế " + maGhe + " đã được đặt. Vui lòng chọn ghế khác."));
                }
                
                danhSachGhe.add(ghe);
            }

            // Create bookings for all passengers (OUTBOUND FLIGHT)
            List<Integer> danhSachMaDatCho = new ArrayList<>();
            List<Integer> danhSachMaHanhKhach = new ArrayList<>();
            java.time.LocalDateTime ngayDatCho = java.time.LocalDateTime.now(); // Same booking date for all
            
            
            for (int i = 0; i < request.getPassengerInfo().size(); i++) {
                CreateBookingRequest.PassengerInfo passengerInfo = request.getPassengerInfo().get(i);
                ChiTietGhe ghe = danhSachGhe.get(i);
                
                // Find or create passenger
                HanhKhach hanhKhach = findOrCreatePassenger(passengerInfo);
                if (i == 0 || !danhSachMaHanhKhach.contains(hanhKhach.getMaHanhKhach())) {
                    danhSachMaHanhKhach.add(hanhKhach.getMaHanhKhach());
                }
                
                // Create booking for OUTBOUND flight
                DatCho datCho = new DatCho();
                datCho.setNgayDatCho(ngayDatCho);
                datCho.setHanhKhach(hanhKhach);
                datCho.setChiTietGhe(ghe);
                
                DatCho savedDatCho = datChoRepository.save(datCho);
                danhSachMaDatCho.add(savedDatCho.getMaDatCho());
                
                // GheDaDat sẽ được tạo sau khi booking hoàn thành và thanh toán
                // Lúc này ta chỉ lưu DatCho tạm thời
            }
            
            // If round-trip, create bookings for RETURN FLIGHT
            if (request.getFlightInfo().getReturnFlight() != null) {
                System.out.println("DEBUG: Processing RETURN FLIGHT");
                
                // Get return flight seats
                List<Integer> danhSachMaGheVe = new ArrayList<>();
                if (request.getFlightInfo().getReturnFlight().getDanhSachMaGhe() != null 
                    && !request.getFlightInfo().getReturnFlight().getDanhSachMaGhe().isEmpty()) {
                    danhSachMaGheVe = request.getFlightInfo().getReturnFlight().getDanhSachMaGhe();
                } else if (request.getFlightInfo().getReturnFlight().getMaGhe() != null) {
                    danhSachMaGheVe.add(request.getFlightInfo().getReturnFlight().getMaGhe());
                }
                
                // Validate return flight seats
                if (danhSachMaGheVe.size() != request.getPassengerInfo().size()) {
                    return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Số lượng ghế chiều về (" + danhSachMaGheVe.size() + ") phải bằng số lượng hành khách (" + request.getPassengerInfo().size() + ")"));
                }
                
                int maChuyenBayReturn = request.getFlightInfo().getReturnFlight().getMaChuyenBay();
                
                List<ChiTietGhe> danhSachGheVe = new ArrayList<>();
                for (Integer maGhe : danhSachMaGheVe) {
                    ChiTietGhe ghe = chiTietGheRepository.findById(maGhe).orElse(null);
                    if (ghe == null) {
                        return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Không tìm thấy ghế chiều về với mã: " + maGhe));
                    }
                    
                    // CHỐNG RACE CONDITION: Kiểm tra ghế đã được đặt chưa
                    if (gheDaDatRepository.existsByChuyenBay_MaChuyenBayAndGhe_MaGhe(maChuyenBayReturn, maGhe)) {
                        return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Ghế chiều về " + maGhe + " đã được đặt. Vui lòng chọn ghế khác."));
                    }
                    
                    danhSachGheVe.add(ghe);
                }
                
                // Create return bookings
                for (int i = 0; i < request.getPassengerInfo().size(); i++) {
                    CreateBookingRequest.PassengerInfo passengerInfo = request.getPassengerInfo().get(i);
                    ChiTietGhe gheVe = danhSachGheVe.get(i);
                    
                    // Use same passenger
                    HanhKhach hanhKhach = findOrCreatePassenger(passengerInfo);
                    
                    // Create booking for RETURN flight
                    DatCho datChoVe = new DatCho();
                    datChoVe.setNgayDatCho(ngayDatCho); // Same booking timestamp
                    datChoVe.setHanhKhach(hanhKhach);
                    datChoVe.setChiTietGhe(gheVe);
                    
                    DatCho savedDatChoVe = datChoRepository.save(datChoVe);
                    danhSachMaDatCho.add(savedDatChoVe.getMaDatCho());
                    
                    // GheDaDat sẽ được tạo sau khi booking hoàn thành và thanh toán
                }
                
                System.out.println("DEBUG: Created " + danhSachMaGheVe.size() + " return flight bookings");
            }

            // Create DonHang (order) first, then link payment to it
            DatCho firstBooking = datChoRepository.findById(danhSachMaDatCho.get(0)).orElseThrow();
            HanhKhach hanhKhachNguoiDat = firstBooking.getHanhKhach();
            
            DonHang donHang = new DonHang();
            donHang.setPnr(generatePNR());
            donHang.setHanhKhachNguoiDat(hanhKhachNguoiDat);
            donHang.setNgayDat(java.time.LocalDateTime.now());
            donHang.setTongGia(request.getTotalAmount());
            donHang.setTrangThai("CHỜ THANH TOÁN");
            donHang.setEmailNguoiDat(hanhKhachNguoiDat.getEmail());
            donHang.setSoDienThoaiNguoiDat(hanhKhachNguoiDat.getSoDienThoai());
            donHang.setGhiChu("");
            DonHang savedDonHang = donHangRepository.save(donHang);
            
            // Link all DatCho to this DonHang
            for (Integer maDatCho : danhSachMaDatCho) {
                DatCho dc = datChoRepository.findById(maDatCho).orElseThrow();
                dc.setDonHang(savedDonHang);
                datChoRepository.save(dc);
            }
            
            // Create payment linked to DonHang
            TrangThaiThanhToan thanhToan = new TrangThaiThanhToan();
            thanhToan.setDonHang(savedDonHang);
            thanhToan.setSoTien(request.getTotalAmount());
            thanhToan.setDaThanhToan('N'); // Not paid yet
            
            // Set expiration time (15 minutes from now)
            Calendar calendar = Calendar.getInstance();
            calendar.add(Calendar.MINUTE, 15);
            thanhToan.setNgayHetHan(calendar.getTime());
            
            TrangThaiThanhToan savedThanhToan = trangThaiThanhToanRepository.save(thanhToan);

            // Create response
            CreateBookingResponse response = new CreateBookingResponse();
            response.setMaDatCho(danhSachMaDatCho.get(0)); // First booking (main)
            response.setMaThanhToan(savedThanhToan.getMaThanhToan());
            response.setMaHanhKhach(danhSachMaHanhKhach.get(0)); // First passenger (main)
            response.setDanhSachMaDatCho(danhSachMaDatCho); // All bookings
            response.setDanhSachMaHanhKhach(danhSachMaHanhKhach); // All passengers

            return ResponseEntity.ok(
                ApiResponse.success("Tạo đặt chỗ thành công cho " + danhSachMaDatCho.size() + " hành khách", response)
            );

        } catch (Exception e) {
            e.printStackTrace(); // Log full stack trace for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi khi tạo đặt chỗ: " + e.getMessage()));
        }
    }
    
    /**
     * Helper method to find existing passenger or create new one
     */
    private HanhKhach findOrCreatePassenger(CreateBookingRequest.PassengerInfo passengerInfo) {
        HanhKhach hanhKhach = null;
        
        // First, try to find by email
        HanhKhach hanhKhachByEmail = hanhKhachRepository.findByEmail(passengerInfo.getEmail())
            .orElse(null);
        
        // Then, try to find by phone number
        HanhKhach hanhKhachByPhone = hanhKhachRepository.findBySoDienThoai(passengerInfo.getPhone())
            .orElse(null);
        
        // Case 1: Found by email
        if (hanhKhachByEmail != null) {
            hanhKhach = hanhKhachByEmail;
            
            // Update phone if different and not used by another passenger
            if (!passengerInfo.getPhone().equals(hanhKhach.getSoDienThoai())) {
                if (hanhKhachByPhone == null || hanhKhachByPhone.getMaHanhKhach() == hanhKhach.getMaHanhKhach()) {
                    hanhKhach.setSoDienThoai(passengerInfo.getPhone());
                }
            }
            
            // Update other info
            hanhKhach.setHoVaTen(passengerInfo.getFullName());
            hanhKhach.setGioiTinh(passengerInfo.getGender());
            hanhKhach.setMaDinhDanh(passengerInfo.getIdNumber());
            
            // Parse birth date if provided
            if (passengerInfo.getBirthDate() != null && !passengerInfo.getBirthDate().isEmpty()) {
                try {
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                    hanhKhach.setNgaySinh(sdf.parse(passengerInfo.getBirthDate()));
                } catch (Exception e) {
                    // Ignore date parsing error
                }
            }
            
            hanhKhach = hanhKhachRepository.save(hanhKhach);
        }
        // Case 2: Not found by email, but found by phone number
        else if (hanhKhachByPhone != null) {
            hanhKhach = hanhKhachByPhone;
            
            // Update info
            hanhKhach.setHoVaTen(passengerInfo.getFullName());
            hanhKhach.setEmail(passengerInfo.getEmail());
            hanhKhach.setGioiTinh(passengerInfo.getGender());
            hanhKhach.setMaDinhDanh(passengerInfo.getIdNumber());
            
            // Parse birth date if provided
            if (passengerInfo.getBirthDate() != null && !passengerInfo.getBirthDate().isEmpty()) {
                try {
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                    hanhKhach.setNgaySinh(sdf.parse(passengerInfo.getBirthDate()));
                } catch (Exception e) {
                    // Ignore date parsing error
                }
            }
            
            hanhKhach = hanhKhachRepository.save(hanhKhach);
        }
        // Case 3: New passenger
        else {
            hanhKhach = new HanhKhach();
            hanhKhach.setHoVaTen(passengerInfo.getFullName());
            hanhKhach.setEmail(passengerInfo.getEmail());
            hanhKhach.setSoDienThoai(passengerInfo.getPhone());
            hanhKhach.setGioiTinh(passengerInfo.getGender());
            hanhKhach.setMaDinhDanh(passengerInfo.getIdNumber());
            
            // Parse birth date if provided
            if (passengerInfo.getBirthDate() != null && !passengerInfo.getBirthDate().isEmpty()) {
                try {
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                    hanhKhach.setNgaySinh(sdf.parse(passengerInfo.getBirthDate()));
                } catch (Exception e) {
                    // Ignore date parsing error
                }
            }
            
            hanhKhach = hanhKhachRepository.save(hanhKhach);
        }
        
        return hanhKhach;
    }

    private String generatePNR() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder pnr = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 6; i++) {
            pnr.append(chars.charAt(random.nextInt(chars.length())));
        }
        return pnr.toString();
    }
}
