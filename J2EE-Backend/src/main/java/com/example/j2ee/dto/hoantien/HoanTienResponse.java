package com.example.j2ee.dto.hoantien;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO cho thông tin hoàn tiền - response cho quản lý hoàn tiền
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoanTienResponse {
    
    private Integer maHoanTien;
    private String maHoaDon;
    private Integer maDatVe;
    private String hoTen;
    private String email;
    private String soDienThoai;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime ngayYeuCau;
    
    private String lyDo;
    private BigDecimal soTienHoan;
    private String trangThai; // CHO_XU_LY, DA_HOAN_TIEN, TU_CHOI
    private String phuongThucHoan; // VNPAY, CHUYEN_KHOAN, TIEN_MAT
    private String taiKhoanHoan;
    private String nguoiXuLy;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime ngayXuLy;
    
    private String lyDoTuChoi;
}
