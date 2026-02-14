package com.example.j2ee.service; // Hoặc package service của bạn

import com.example.j2ee.dto.*;
import com.example.j2ee.model.HanhKhach;
import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.repository.HanhKhachRepository;
import com.example.j2ee.repository.TaiKhoanRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class HanhKhachService {

    private final HanhKhachRepository hanhKhachRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Regex chuẩn cho Việt Nam: bắt đầu bằng 0 hoặc +84, theo sau là đầu số 3/5/7/8/9 và 8 chữ số
    private static final Pattern PHONE_PATTERN = Pattern.compile("^(0|\\+84)(3|5|7|8|9)\\d{8}$");
    // Regex email thông dụng (đơn giản, thân thiện)
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    public HanhKhachService(HanhKhachRepository hanhKhachRepository, TaiKhoanRepository taiKhoanRepository) {
        this.hanhKhachRepository = hanhKhachRepository;
        this.taiKhoanRepository = taiKhoanRepository;
    }

    /**
     * Lấy danh sách tất cả hành khách.
     * @return Danh sách HanhKhach.
     */
    public List<HanhKhach> getAllHanhKhach() {
        return hanhKhachRepository.findAll();
    }

    /**
     * Lấy thông tin một hành khách theo ID.
     * @param id Mã hành khách.
     * @return Optional chứa HanhKhach nếu tìm thấy.
     */
    public Optional<HanhKhach> getHanhKhachById(int id) {
        return hanhKhachRepository.findById(id);
    }

    /**
     * Thêm mới hành khách dựa trên schema hanhkhach.
     */
    public HanhKhach createHanhKhach(HanhKhach input) {
        // Chuẩn hoá dữ liệu vào (trim khoảng trắng vô ý)
        if (input.getEmail() != null) input.setEmail(input.getEmail().trim());
        if (input.getSoDienThoai() != null) input.setSoDienThoai(input.getSoDienThoai().trim());

        // Validate định dạng email và số điện thoại bằng regex
        if (input.getEmail() != null && !EMAIL_PATTERN.matcher(input.getEmail()).matches()) {
            throw new DataIntegrityViolationException("Định dạng email không hợp lệ: " + input.getEmail());
        }
        if (input.getSoDienThoai() != null && !PHONE_PATTERN.matcher(input.getSoDienThoai()).matches()) {
            throw new DataIntegrityViolationException("Định dạng số điện thoại không hợp lệ: " + input.getSoDienThoai());
        }

        // LƯU Ý: Mã định danh (CCCD/CMND/Passport) là identifier chính
        // Nếu tìm thấy mã định danh trùng → Ghi đè (update) thông tin hành khách
        if (input.getMaDinhDanh() != null) {
            Optional<HanhKhach> existingByMaDinhDanh = hanhKhachRepository.findByMaDinhDanh(input.getMaDinhDanh());
            if (existingByMaDinhDanh.isPresent()) {
                // Cập nhật thông tin hành khách hiện có
                HanhKhach existing = existingByMaDinhDanh.get();
                existing.setHoVaTen(input.getHoVaTen());
                existing.setNgaySinh(input.getNgaySinh());
                existing.setGioiTinh(input.getGioiTinh());
                existing.setSoDienThoai(input.getSoDienThoai());
                existing.setEmail(input.getEmail());
                existing.setDiaChi(input.getDiaChi());
                existing.setQuocGia(input.getQuocGia());
                return hanhKhachRepository.save(existing);
            }
        }
        
        // LƯU Ý: Đã xóa validation unique cho email và số điện thoại
        // để cho phép khách vãng lai đặt vé cho nhiều người với cùng thông tin liên hệ
        
        // kiểm tra ngày sinh lớn hơn 2 tuổi
        if (input.getNgaySinh() != null) {
            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.LocalDate minBirthDate = today.minusYears(2);
            java.time.LocalDate birthDate = input.getNgaySinh().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
            if (birthDate.isAfter(minBirthDate)) {
                throw new DataIntegrityViolationException("Hành khách phải lớn hơn 2 tuổi.");
            }
        }
        return hanhKhachRepository.save(input);
    }

    /**
     * Cập nhật thông tin hành khách theo id. Trả về Optional của bản ghi đã cập nhật.
     */
    public Optional<HanhKhach> updateHanhKhach(int id, HanhKhach input) {
        // Chuẩn hoá dữ liệu vào (trim khoảng trắng vô ý)
        if (input.getEmail() != null) input.setEmail(input.getEmail().trim());
        if (input.getSoDienThoai() != null) input.setSoDienThoai(input.getSoDienThoai().trim());

        // Validate định dạng email và số điện thoại bằng regex (nếu được gửi lên để cập nhật)
        if (input.getEmail() != null && !EMAIL_PATTERN.matcher(input.getEmail()).matches()) {
            throw new IllegalArgumentException("Định dạng email không hợp lệ: " + input.getEmail());
        }
        if (input.getSoDienThoai() != null && !PHONE_PATTERN.matcher(input.getSoDienThoai()).matches()) {
            throw new IllegalArgumentException("Định dạng số điện thoại không hợp lệ: " + input.getSoDienThoai());
        }

        return hanhKhachRepository.findById(id).map(existing -> {
            // LƯU Ý: Đã xóa validation unique cho email và số điện thoại
            // để cho phép khách vãng lai có thể trùng lặp thông tin liên hệ

            // Cập nhật toàn bộ các trường theo schema
            existing.setHoVaTen(input.getHoVaTen());
            existing.setNgaySinh(input.getNgaySinh());
            existing.setGioiTinh(input.getGioiTinh());
            existing.setSoDienThoai(input.getSoDienThoai());
            existing.setEmail(input.getEmail());
            existing.setMaDinhDanh(input.getMaDinhDanh());
            existing.setDiaChi(input.getDiaChi());
            existing.setQuocGia(input.getQuocGia());

            return hanhKhachRepository.save(existing);
        });
    }

    /**
     * Xóa hành khách theo id. Trả về true nếu xóa được, false nếu không tìm thấy.
     */
    public boolean deleteHanhKhach(int id) {
        if (!hanhKhachRepository.existsById(id)) {
            return false;
        }
        hanhKhachRepository.deleteById(id);
        return true;
    }

    /**
     * Lấy danh sách chuyến bay của khách hàng theo ID
     */
    public List<ChuyenBayKhachHangDTO> getChuyenBayByKhachHang(int maHanhKhach) {
        List<Object[]> results = hanhKhachRepository.findChuyenBayByKhachHang(maHanhKhach);
        
        return results.stream().map(row -> {
            ChuyenBayKhachHangDTO dto = new ChuyenBayKhachHangDTO();
            dto.setMaDatCho((Integer) row[0]);
            dto.setSoHieuChuyenBay((String) row[1]);
            dto.setDiemDi((String) row[2]);
            dto.setDiemDen((String) row[3]);
            
            // Convert SQL Date to LocalDate
            if (row[4] instanceof Date) {
                dto.setNgayDi(((Date) row[4]).toLocalDate());
            }
            
            dto.setTongTien((BigDecimal) row[5]);
            
            // Lấy danh sách dịch vụ cho đặt chỗ này
            List<DichVuDaDatDTO> dichVuList = getDichVuByDatCho((Integer) row[0]);
            dto.setDichVuDaDat(dichVuList);
            
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Lấy danh sách dịch vụ của một đặt chỗ
     */
    private List<DichVuDaDatDTO> getDichVuByDatCho(int maDatCho) {
        List<Object[]> results = hanhKhachRepository.findDichVuByDatCho(maDatCho);

        return results.stream().map(row -> {
            DichVuDaDatDTO dto = new DichVuDaDatDTO();
            dto.setTenLuaChon((String) row[0]);
            dto.setSoLuong((Integer) row[1]);
            dto.setDonGia((BigDecimal) row[2]);
            return dto;
        }).collect(Collectors.toList());
    }

    // ==================== NEW METHODS FOR VIEW CUSTOMER MODAL ====================

    /**
     * Lấy thông tin tài khoản của khách hàng
     * @param maHanhKhach Mã hành khách
     * @return TaiKhoanKhachHangDTO nếu tìm thấy, Optional.empty nếu không có
     */
    public Optional<TaiKhoanKhachHangDTO> getTaiKhoanKhachHang(Integer maHanhKhach) {
        Optional<TaiKhoan> taiKhoanOpt = taiKhoanRepository.findByHanhKhach_MaHanhKhach(maHanhKhach);
        if (taiKhoanOpt.isEmpty()) {
            return Optional.empty();
        }

        TaiKhoan taiKhoan = taiKhoanOpt.get();
        TaiKhoanKhachHangDTO dto = new TaiKhoanKhachHangDTO();
        dto.setEmail(taiKhoan.getEmail());
        dto.setTrangThai(taiKhoan.getTrangThai());

        // Convert ngayTao from Date to LocalDateTime
        if (taiKhoan.getNgayTao() != null) {
            dto.setNgayTao(LocalDateTime.ofInstant(
                new java.util.Date(taiKhoan.getNgayTao().getTime()).toInstant(),
                ZoneId.systemDefault()
            ));
        }

        // Xác định phương thức đăng nhập
        if (taiKhoan.getOauth2Provider() != null) {
            dto.setPhuongThucDangNhap(taiKhoan.getOauth2Provider()); // "GOOGLE", "FACEBOOK"
        } else {
            dto.setPhuongThucDangNhap("EMAIL");
        }

        dto.setDaXacThucEmail(taiKhoan.isEmailVerified());

        return Optional.of(dto);
    }

    /**
     * Cập nhật thông tin khách hàng (partial update)
     * @param maHanhKhach Mã hành khách
     * @param request Request chứa các trường cần cập nhật
     * @return HanhKhach đã cập nhật
     */
    public Optional<HanhKhach> updateKhachHangPartial(Integer maHanhKhach, UpdateKhachHangRequest request) {
        return hanhKhachRepository.findById(maHanhKhach).map(existing -> {
            // Chỉ cập nhật các trường có trong request (không cập nhật email và maDinhDanh)
            if (request.getHoVaTen() != null) {
                existing.setHoVaTen(request.getHoVaTen());
            }
            if (request.getNgaySinh() != null) {
                existing.setNgaySinh(Date.valueOf(request.getNgaySinh()));
            }
            if (request.getGioiTinh() != null) {
                existing.setGioiTinh(request.getGioiTinh());
            }
            if (request.getDiaChi() != null) {
                existing.setDiaChi(request.getDiaChi());
            }
            if (request.getSoDienThoai() != null) {
                // Validate số điện thoại
                if (!PHONE_PATTERN.matcher(request.getSoDienThoai()).matches()) {
                    throw new IllegalArgumentException("Định dạng số điện thoại không hợp lệ: " + request.getSoDienThoai());
                }
                // Kiểm tra unique nếu thay đổi
                if (!request.getSoDienThoai().equals(existing.getSoDienThoai())) {
                    hanhKhachRepository.findBySoDienThoai(request.getSoDienThoai())
                        .filter(other -> other.getMaHanhKhach() != maHanhKhach)
                        .ifPresent(other -> {
                            throw new DataIntegrityViolationException("Số điện thoại đã tồn tại: " + request.getSoDienThoai());
                        });
                }
                existing.setSoDienThoai(request.getSoDienThoai());
            }
            if (request.getQuocGia() != null) {
                existing.setQuocGia(request.getQuocGia());
            }

            return hanhKhachRepository.save(existing);
        });
    }

    /**
     * Đổi mật khẩu cho khách hàng (thực hiện bởi admin)
     * @param maHanhKhach Mã hành khách
     * @param matKhauMoi Mật khẩu mới
     * @return true nếu thành công, false nếu không tìm thấy tài khoản
     */
    public boolean doiMatKhauKhachHang(Integer maHanhKhach, String matKhauMoi) {
        Optional<TaiKhoan> taiKhoanOpt = taiKhoanRepository.findByHanhKhach_MaHanhKhach(maHanhKhach);
        if (taiKhoanOpt.isEmpty()) {
            return false;
        }

        TaiKhoan taiKhoan = taiKhoanOpt.get();

        // Kiểm tra nếu tài khoản là OAuth (Google, Facebook) thì không đổi được mật khẩu
        if (taiKhoan.getOauth2Provider() != null && !taiKhoan.getOauth2Provider().isEmpty()) {
            throw new IllegalArgumentException("Tài khoản đăng nhập bằng " + taiKhoan.getOauth2Provider() + " không thể đổi mật khẩu.");
        }

        // Hash mật khẩu mới và cập nhật
        String hashedPassword = passwordEncoder.encode(matKhauMoi);
        taiKhoan.setMatKhauBam(hashedPassword);
        taiKhoanRepository.save(taiKhoan);

        return true;
    }

    // ==================== BUSINESS LOGIC FOR BOOKING ====================

    /**
     * Tìm hoặc tạo hành khách mới cho đặt vé
     * Logic nghiệp vụ:
     * 1. Ưu tiên tìm theo mã định danh (CCCD/CMND/Passport) nếu có
     * 2. Nếu tìm thấy theo CCCD → Ghi đè toàn bộ thông tin
     * 3. Nếu không có CCCD → Tìm theo email/phone (cho phép khách vãng lai)
     * 
     * @param passengerInfo Thông tin hành khách từ booking request
     * @return HanhKhach đã được tạo hoặc cập nhật
     */
    public HanhKhach findOrCreateHanhKhach(com.example.j2ee.dto.datcho.CreateBookingRequest.PassengerInfo passengerInfo) {
        HanhKhach hanhKhach = null;
        
        // ƯU TIÊN 1: Tìm theo mã định danh (CCCD/CMND/Passport) nếu có
        if (passengerInfo.getIdNumber() != null && !passengerInfo.getIdNumber().trim().isEmpty()) {
            HanhKhach hanhKhachByCCCD = hanhKhachRepository.findByMaDinhDanh(passengerInfo.getIdNumber()).orElse(null);
            
            if (hanhKhachByCCCD != null) {
                // Tìm thấy theo CCCD → GHI ĐÈ toàn bộ thông tin
                hanhKhach = hanhKhachByCCCD;
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
                
                return hanhKhachRepository.save(hanhKhach);
            } else {
                // Không tìm thấy theo CCCD → Tạo mới với CCCD này
                hanhKhach = createNewPassenger(passengerInfo);
                return hanhKhachRepository.save(hanhKhach);
            }
        }
        
        // ƯU TIÊN 2: Nếu không có CCCD → Tìm theo email/phone (khách vãng lai)
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
            // Tạo mới (cho phép trùng email/phone cho khách vãng lai)
            hanhKhach = createNewPassenger(passengerInfo);
        }
        
        return hanhKhachRepository.save(hanhKhach);
    }

    /**
     * Cập nhật thông tin hành khách từ passenger info
     */
    private void updatePassengerInfo(HanhKhach hanhKhach, 
                                      com.example.j2ee.dto.datcho.CreateBookingRequest.PassengerInfo passengerInfo, 
                                      HanhKhach hanhKhachByPhone) {
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

    /**
     * Tạo hành khách mới từ passenger info
     */
    private HanhKhach createNewPassenger(com.example.j2ee.dto.datcho.CreateBookingRequest.PassengerInfo passengerInfo) {
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
}