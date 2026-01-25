package com.example.j2ee.service;

import com.example.j2ee.dto.donhang.DonHangDetailResponse;
import com.example.j2ee.dto.donhang.DonHangResponse;
import com.example.j2ee.dto.donhang.HuyDonHangRequest;
import com.example.j2ee.dto.donhang.UpdateTrangThaiDonHangRequest;
import com.example.j2ee.model.ChiTietChuyenBay;
import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.DonHang;
import com.example.j2ee.repository.DatChoRepository;
import com.example.j2ee.repository.DonHangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DonHangService {

    private final DonHangRepository donHangRepository;
    private final DatChoRepository datChoRepository;

    /**
     * Lấy danh sách đơn hàng với bộ lọc và sắp xếp
     */
    public List<DonHangResponse> getAllDonHang(
            String trangThai,
            String email,
            String soDienThoai,
            String pnr,
            LocalDateTime tuNgay,
            LocalDateTime denNgay,
            BigDecimal tuGia,
            BigDecimal denGia,
            String sort
    ) {
        Specification<DonHang> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by status (trạng thái)
            if (trangThai != null && !trangThai.isEmpty()) {
                predicates.add(cb.equal(root.get("trangThai"), trangThai));
            }

            // Filter by email
            if (email != null && !email.isEmpty()) {
                predicates.add(cb.like(
                    cb.lower(root.get("emailNguoiDat")),
                    "%" + email.toLowerCase() + "%"
                ));
            }

            // Filter by phone number
            if (soDienThoai != null && !soDienThoai.isEmpty()) {
                predicates.add(cb.like(
                    root.get("soDienThoaiNguoiDat"),
                    "%" + soDienThoai + "%"
                ));
            }

            // Filter by PNR
            if (pnr != null && !pnr.isEmpty()) {
                predicates.add(cb.like(
                    cb.upper(root.get("pnr")),
                    "%" + pnr.toUpperCase() + "%"
                ));
            }

            // Filter by date range (ngày đặt)
            if (tuNgay != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("ngayDat"), tuNgay));
            }
            if (denNgay != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("ngayDat"), denNgay));
            }

            // Filter by price range (tổng giá)
            if (tuGia != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("tongGia"), tuGia));
            }
            if (denGia != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("tongGia"), denGia));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // Apply sorting
        List<DonHang> donHangList;
        if (sort != null && !sort.isEmpty()) {
            org.springframework.data.domain.Sort sortOption = createSortOption(sort);
            donHangList = donHangRepository.findAll(spec, sortOption);
        } else {
            // Default sort by order date descending
            donHangList = donHangRepository.findAll(
                spec,
                org.springframework.data.domain.Sort.by(
                    org.springframework.data.domain.Sort.Direction.DESC,
                    "ngayDat"
                )
            );
        }

        return donHangList.stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Tạo tùy chọn sắp xếp dựa trên tham số sort
     * Format: "field" hoặc "field:asc" hoặc "field:desc"
     */
    private org.springframework.data.domain.Sort createSortOption(String sort) {
        String[] parts = sort.split(":");
        String field = parts[0];
        org.springframework.data.domain.Sort.Direction direction =
            org.springframework.data.domain.Sort.Direction.DESC;

        if (parts.length > 1) {
            String dir = parts[1].toLowerCase();
            if ("asc".equals(dir)) {
                direction = org.springframework.data.domain.Sort.Direction.ASC;
            }
        }

        // Map field names to entity fields
        String entityField = mapSortField(field);
        return org.springframework.data.domain.Sort.by(direction, entityField);
    }

    /**
     * Mapping tham số sort sang field thực tế trong entity
     */
    private String mapSortField(String field) {
        return switch (field.toLowerCase()) {
            case "ngaydat" -> "ngayDat";
            case "tonggia" -> "tongGia";
            case "trangthai" -> "trangThai";
            case "pnr" -> "pnr";
            default -> "ngayDat"; // Default sort field
        };
    }

    /**
     * Lấy chi tiết đơn hàng theo ID
     */
    public DonHangDetailResponse getDonHangById(int id) {
        DonHang donHang = donHangRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng với ID: " + id));

        return mapToDetailResponse(donHang);
    }

    /**
     * Tìm đơn hàng theo mã PNR
     */
    public DonHangDetailResponse getDonHangByPnr(String pnr) {
        DonHang donHang = donHangRepository.findByPnr(pnr)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng với PNR: " + pnr));

        return mapToDetailResponse(donHang);
    }

    /**
     * Cập nhật trạng thái đơn hàng
     */
    @Transactional
    public DonHangResponse updateTrangThai(int id, UpdateTrangThaiDonHangRequest request) {
        // Tìm đơn hàng theo ID
        DonHang donHang = donHangRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng với ID: " + id));

        String currentStatus = donHang.getTrangThai();
        String newStatus = request.getTrangThai();

        // Validate trạng thái mới
        if (!isValidStatus(newStatus)) {
            throw new IllegalArgumentException(
                "Trạng thái không hợp lệ. Giá trị hợp lệ: CHỜ THANH TOÁN, ĐÃ THANH TOÁN, ĐÃ HỦY"
            );
        }

        // Validate chuyển đổi trạng thái
        if (!isValidStateTransition(currentStatus, newStatus)) {
            throw new IllegalArgumentException(
                "Không thể chuyển từ trạng thái '" + currentStatus + "' sang '" + newStatus + "'"
            );
        }

        // Cập nhật trạng thái
        donHang.setTrangThai(newStatus);
        donHangRepository.save(donHang);

        // Map và trả về response
        return mapToResponse(donHang);
    }

    /**
     * Kiểm tra trạng thái có hợp lệ không
     */
    private boolean isValidStatus(String status) {
        return "CHỜ THANH TOÁN".equals(status)
            || "ĐÃ THANH TOÁN".equals(status)
            || "ĐÃ HỦY".equals(status);
    }

    /**
     * Kiểm tra chuyển đổi trạng thái có hợp lệ không
     * Các chuyển đổi hợp lệ:
     * - CHỜ THANH TOÁN → ĐÃ THANH TOÁN
     * - CHỜ THANH TOÁN → ĐÃ HỦY
     * - ĐÃ THANH TOÁN → ĐÃ HỦY (hoàn tiền)
     * - ĐÃ HỦY → CHỜ THANH TOÁN (khôi phục)
     */
    private boolean isValidStateTransition(String currentStatus, String newStatus) {
        // Nếu trạng thái mới giống trạng thái hiện tại, không làm gì
        if (currentStatus.equals(newStatus)) {
            return false;
        }

        // CHỜ THANH TOÁN có thể chuyển thành ĐÃ THANH TOÁN hoặc ĐÃ HỦY
        if ("CHỜ THANH TOÁN".equals(currentStatus)) {
            return "ĐÃ THANH TOÁN".equals(newStatus) || "ĐÃ HỦY".equals(newStatus);
        }

        // ĐÃ THANH TOÁN chỉ có thể chuyển thành ĐÃ HỦY (hoàn tiền)
        if ("ĐÃ THANH TOÁN".equals(currentStatus)) {
            return "ĐÃ HỦY".equals(newStatus);
        }

        // ĐÃ HỦY chỉ có thể chuyển thành CHỜ THANH TOÁN (khôi phục)
        if ("ĐÃ HỦY".equals(currentStatus)) {
            return "CHỜ THANH TOÁN".equals(newStatus);
        }

        return false;
    }

    /**
     * Hủy đơn hàng với các quy tắc kinh doanh
     * Quy tắc:
     * - Không thể hủy đơn hàng đã có hành khách check-in
     * - Không thể hủy đơn hàng sau khi chuyến bay đã khởi hành
     * - Không thể hủy đơn hàng đã ở trạng thái ĐÃ HỦY
     * - Cập nhật tất cả DatCho sang trạng thái CANCELLED
     */
    @Transactional
    public DonHangResponse huyDonHang(int id, HuyDonHangRequest request) {
        // Bước 1: Tìm đơn hàng theo ID
        DonHang donHang = donHangRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng với ID: " + id));

        // Bước 2: Kiểm tra đơn hàng đã bị hủy chưa
        if ("ĐÃ HỦY".equals(donHang.getTrangThai())) {
            throw new IllegalArgumentException("Đơn hàng đã ở trạng thái ĐÃ HỦY");
        }

        // Bước 3: Kiểm tra trạng thái check-in của tất cả hành khách
        Set<DatCho> danhSachDatCho = donHang.getDanhSachDatCho();
        if (danhSachDatCho != null && !danhSachDatCho.isEmpty()) {
            for (DatCho datCho : danhSachDatCho) {
                if (datCho.isCheckInStatus()) {
                    throw new IllegalArgumentException("Không thể hủy đơn hàng đã có hành khách check-in");
                }
            }
        }

        // Bước 4: Kiểm tra thời gian khởi hành của chuyến bay
        if (danhSachDatCho != null && !danhSachDatCho.isEmpty()) {
            // Lấy chuyến bay đầu tiên (giả sử tất cả DatCho trong cùng một đơn hàng là cùng một chuyến bay)
            DatCho firstDatCho = danhSachDatCho.iterator().next();
            ChiTietChuyenBay chuyenBay = firstDatCho.getChuyenBay();

            if (chuyenBay != null) {
                // Tính toán thời gian khởi hành dự kiến
                LocalDateTime thoiGianKhoiHanh = LocalDateTime.of(
                    chuyenBay.getNgayDi(),
                    chuyenBay.getGioDi()
                );

                // Kiểm tra nếu chuyến bay đã khởi hành
                LocalDateTime thoiGianHienTai = LocalDateTime.now();
                if (thoiGianHienTai.isAfter(thoiGianKhoiHanh)) {
                    throw new IllegalArgumentException("Không thể hủy đơn hàng sau khi chuyến bay đã khởi hành");
                }
            }
        }

        // Bước 5: Cập nhật ghiChu với lý do hủy
        String ghiChuHienTai = donHang.getGhiChu();
        String lyDoHuy = request.getLyDoHuy();
        if (ghiChuHienTai != null && !ghiChuHienTai.isEmpty()) {
            donHang.setGhiChu(ghiChuHienTai + "\n[Lý do hủy: " + lyDoHuy + "]");
        } else {
            donHang.setGhiChu("[Lý do hủy: " + lyDoHuy + "]");
        }

        // Bước 6: Cập nhật trạng thái đơn hàng sang ĐÃ HỦY
        donHang.setTrangThai("ĐÃ HỦY");
        donHangRepository.save(donHang);

        // Bước 7: Cập nhật tất cả DatCho sang trạng thái CANCELLED
        if (danhSachDatCho != null && !danhSachDatCho.isEmpty()) {
            for (DatCho datCho : danhSachDatCho) {
                datCho.setTrangThai("CANCELLED");
                datChoRepository.save(datCho);
            }
        }

        // Map và trả về response
        return mapToResponse(donHang);
    }

    /**
     * Lấy danh sách đơn hàng đã xóa mềm
     */
    public List<DonHangResponse> getDeletedDonHang() {
        List<DonHang> deletedOrders = donHangRepository.findAllDeleted();
        return deletedOrders.stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Khôi phục đơn hàng đã xóa mềm
     * Quy tắc:
     * - Chỉ khôi phục được đơn hàng đã bị xóa (da_xoa = true)
     * - Xóa các cờ da_xoa và deleted_at
     */
    @Transactional
    public void restoreDonHang(int id) {
        // Bước 1: Kiểm tra đơn hàng có bị xóa không
        DonHang donHang = donHangRepository.findDeletedById(id)
                .orElseThrow(() -> new IllegalArgumentException("Đơn hàng chưa bị xóa hoặc không tồn tại"));

        // Bước 2: Kiểm tra đơn hàng đã bị xóa chưa
        if (donHang.getDaXoa() == null || !donHang.getDaXoa()) {
            throw new IllegalArgumentException("Đơn hàng chưa bị xóa");
        }

        // Bước 3: Khôi phục đơn hàng bằng cách xóa cờ soft delete
        donHangRepository.restoreById(id);
    }

    /**
     * Xóa mềm đơn hàng
     */
    @Transactional
    public void softDeleteDonHang(int id) {
        DonHang donHang = donHangRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng với ID: " + id));

        // Không thể xóa đơn hàng đã thanh toán
        if ("ĐÃ THANH TOÁN".equals(donHang.getTrangThai())) {
            throw new IllegalArgumentException("Không thể xóa đơn hàng đã thanh toán");
        }

        donHangRepository.delete(donHang);
    }

    /**
     * Mapper từ DonHang entity sang DonHangResponse DTO
     */
    private DonHangResponse mapToResponse(DonHang donHang) {
        DonHangResponse response = new DonHangResponse();
        response.setMaDonHang(donHang.getMaDonHang());
        response.setPnr(donHang.getPnr());
        response.setNgayDat(donHang.getNgayDat());
        response.setTongGia(donHang.getTongGia());
        response.setTrangThai(donHang.getTrangThai());
        response.setEmailNguoiDat(donHang.getEmailNguoiDat());
        response.setSoDienThoaiNguoiDat(donHang.getSoDienThoaiNguoiDat());
        response.setCreatedAt(donHang.getCreatedAt());
        response.setUpdatedAt(donHang.getUpdatedAt());
        return response;
    }

    /**
     * Mapper từ DonHang entity sang DonHangDetailResponse DTO
     */
    private DonHangDetailResponse mapToDetailResponse(DonHang donHang) {
        DonHangDetailResponse response = new DonHangDetailResponse();
        response.setMaDonHang(donHang.getMaDonHang());
        response.setPnr(donHang.getPnr());
        response.setHanhKhachNguoiDat(donHang.getHanhKhachNguoiDat());
        response.setNgayDat(donHang.getNgayDat());
        response.setTongGia(donHang.getTongGia());
        response.setTrangThai(donHang.getTrangThai());
        response.setEmailNguoiDat(donHang.getEmailNguoiDat());
        response.setSoDienThoaiNguoiDat(donHang.getSoDienThoaiNguoiDat());
        response.setGhiChu(donHang.getGhiChu());
        response.setCreatedAt(donHang.getCreatedAt());
        response.setUpdatedAt(donHang.getUpdatedAt());
        response.setDanhSachDatCho(donHang.getDanhSachDatCho());
        return response;
    }
}
