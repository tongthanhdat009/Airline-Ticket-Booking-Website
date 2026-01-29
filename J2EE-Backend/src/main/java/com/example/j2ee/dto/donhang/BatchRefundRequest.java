package com.example.j2ee.dto.donhang;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * DTO cho batch refund request
 */
@Data
public class BatchRefundRequest {
    /**
     * Danh sách mã đơn hàng cần hoàn tiền
     */
    @NotEmpty(message = "Danh sách mã đơn hàng không được rỗng")
    private List<Integer> maDonHangs;

    /**
     * Lý do hoàn tiền
     */
    @NotBlank(message = "Lý do hoàn tiền không được rỗng")
    private String lyDoHoanTien;
}
