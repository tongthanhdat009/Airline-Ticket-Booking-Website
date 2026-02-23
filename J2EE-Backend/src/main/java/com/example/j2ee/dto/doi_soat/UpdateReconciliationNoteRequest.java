package com.example.j2ee.dto.doi_soat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO Request cho cập nhật ghi chú xử lý đối soát
 * Dùng khi kế toán/admin xử lý các giao dịch lệch
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReconciliationNoteRequest {

    /**
     * Ghi chú về việc xử lý giao dịch lệch
     * Ví dụ: "Đã liên hệ VNPay xác nhận", "Khách đã hoàn trả", "Giao dịch hợp lệ"
     */
    @NotBlank(message = "Ghi chú không được để trống")
    @Size(max = 500, message = "Ghi chú không được quá 500 ký tự")
    private String ghiChu;

    /**
     * Người xử lý (email hoặc tên đăng nhập)
     */
    @NotBlank(message = "Người xử lý không được để trống")
    @Size(max = 100, message = "Người xử lý không được quá 100 ký tự")
    private String nguoiXuLy;

    /**
     * Trạng thái xử lý: RESOLVED (đã xử lý), IGNORED (bỏ qua), PENDING (chờ xử lý)
     */
    private String trangThai = "RESOLVED";
}
