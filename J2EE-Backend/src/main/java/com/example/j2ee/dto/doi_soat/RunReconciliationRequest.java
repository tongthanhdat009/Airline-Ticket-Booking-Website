package com.example.j2ee.dto.doi_soat;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO Request cho chạy đối soát thủ công
 * Dùng để chạy lại đối soát cho một khoảng thời gian cụ thể
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RunReconciliationRequest {

    /**
     * Ngày bắt đầu đối soát
     */
    @NotNull(message = "Từ ngày không được để trống")
    private LocalDate tuNgay;

    /**
     * Ngày kết thúc đối soát
     */
    @NotNull(message = "Đến ngày không được để trống")
    private LocalDate denNgay;

    /**
     * Có bao gồm giao dịch khớp (MATCHED) không?
     * false = chỉ trả về giao dịch lệch
     * true = trả về tất cả
     */
    private Boolean includeMatched = false;
}
