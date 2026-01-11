package com.example.j2ee.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckInResponse {
    private boolean success;
    private String message;
    private BookingInfo bookingInfo;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingInfo {
        private int maDatCho;
        private LocalDateTime ngayDatCho;
        
        // Thông tin hành khách
        private String hoVaTen;
        private String email;
        private String soDienThoai;
        private Date ngaySinh;
        private String gioiTinh;
        
        // Thông tin chuyến bay
        private String soHieuChuyenBay;
        private LocalDate ngayDi;
        private String gioDi;
        private LocalDate ngayDen;
        private String gioDen;
        private String tenSanBayDi;
        private String maSanBayDi;
        private String tenSanBayDen;
        private String maSanBayDen;
        
        // Thông tin ghế
        private int maGhe;
        private String tenHangVe;
        
        // Trạng thái thanh toán
        private boolean daThanhToan;
        private Double soTien;
        
        // Check-in status
        private boolean daCheckIn;
    }
}
