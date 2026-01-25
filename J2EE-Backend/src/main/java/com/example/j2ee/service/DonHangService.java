package com.example.j2ee.service;

import com.example.j2ee.dto.donhang.DonHangDetailResponse;
import com.example.j2ee.dto.donhang.DonHangResponse;
import com.example.j2ee.dto.donhang.HuyDonHangRequest;
import com.example.j2ee.dto.donhang.UpdateTrangThaiDonHangRequest;
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
        // Implementation will be added in subtask-2-3
        throw new UnsupportedOperationException("Method to be implemented in subtask-2-3");
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
        // Implementation will be added in subtask-2-4
        throw new UnsupportedOperationException("Method to be implemented in subtask-2-4");
    }

    /**
     * Hủy đơn hàng với các quy tắc kinh doanh
     */
    @Transactional
    public void huyDonHang(int id, HuyDonHangRequest request) {
        // Implementation will be added in subtask-2-5
        throw new UnsupportedOperationException("Method to be implemented in subtask-2-5");
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
     */
    @Transactional
    public void restoreDonHang(int id) {
        // Implementation will be added in subtask-2-6
        throw new UnsupportedOperationException("Method to be implemented in subtask-2-6");
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
