package com.example.j2ee.dto.khuyenmai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO cho khuyến mãi
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhuyenMaiResponse {

    private Integer maKhuyenMai;
    private String maKM;
    private String tenKhuyenMai;
    private String moTa;
    private String loaiKhuyenMai;
    private BigDecimal giaTriGiam;
    private BigDecimal giaTriToiThieu;
    private BigDecimal giaTriToiDa;
    private Integer soLuong;
    private Integer soLuongDaDuocDung;
    private Integer soLuongConLai;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private String trangThai;
    private LocalDateTime ngayTao;
    private Boolean daXoa;
    private LocalDateTime deletedAt;

    // Helper field để tính số lượng còn lại
    public Integer getSoLuongConLai() {
        if (soLuong == null) {
            return null; // Unlimited
        }
        return soLuong - (soLuongDaDuocDung != null ? soLuongDaDuocDung : 0);
    }

    /**
     * Chuyển đổi từ entity KhuyenMai sang DTO
     */
    public static KhuyenMaiResponse fromEntity(com.example.j2ee.model.KhuyenMai entity) {
        return KhuyenMaiResponse.builder()
                .maKhuyenMai(entity.getMaKhuyenMai())
                .maKM(entity.getMaKM())
                .tenKhuyenMai(entity.getTenKhuyenMai())
                .moTa(entity.getMoTa())
                .loaiKhuyenMai(entity.getLoaiKhuyenMai())
                .giaTriGiam(entity.getGiaTriGiam())
                .giaTriToiThieu(entity.getGiaTriToiThieu())
                .giaTriToiDa(entity.getGiaTriToiDa())
                .soLuong(entity.getSoLuong())
                .soLuongDaDuocDung(entity.getSoLuongDaDuocDung())
                .ngayBatDau(entity.getNgayBatDau())
                .ngayKetThuc(entity.getNgayKetThuc())
                .trangThai(entity.getTrangThai())
                .ngayTao(entity.getNgayTao())
                .daXoa(entity.getDaXoa())
                .deletedAt(entity.getDeletedAt())
                .build();
    }
}
