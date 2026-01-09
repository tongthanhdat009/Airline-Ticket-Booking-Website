package com.example.j2ee.dto.datcho;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Response DTO after creating a booking with payment record
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingResponse {
    
    /**
     * Booking ID (mã đặt chỗ) - for backward compatibility
     */
    private Integer maDatCho;
    
    /**
     * Payment ID (mã thanh toán) for VNPay
     */
    private Integer maThanhToan;
    
    /**
     * Passenger ID (mã hành khách) - for backward compatibility
     */
    private Integer maHanhKhach;
    
    /**
     * List of all booking IDs created (for multiple passengers)
     */
    private List<Integer> danhSachMaDatCho;
    
    /**
     * List of all passenger IDs created (for multiple passengers)
     */
    private List<Integer> danhSachMaHanhKhach;
}
