package com.example.j2ee.dto.donhang;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * DTO cho batch approve payment request
 */
@Data
public class BatchApproveRequest {
    /**
     * Danh sách mã đơn hàng cần duyệt thanh toán
     */
    @NotEmpty(message = "Danh sách mã đơn hàng không được rỗng")
    private List<Integer> maDonHangs;
}
