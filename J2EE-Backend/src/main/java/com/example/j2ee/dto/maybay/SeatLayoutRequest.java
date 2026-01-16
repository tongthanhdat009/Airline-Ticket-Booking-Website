package com.example.j2ee.dto.maybay;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO để tạo hoặc cập nhật thông tin ghế
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatLayoutRequest {

    private Integer maHangVe;
    private String soGhe;
    private String viTriGhe; // CỬA SỔ, LỐI ĐI, GIỮA
    private Integer hang; // Số hàng
    private String cot; // Cột (A, B, C, D, E, F)
}
