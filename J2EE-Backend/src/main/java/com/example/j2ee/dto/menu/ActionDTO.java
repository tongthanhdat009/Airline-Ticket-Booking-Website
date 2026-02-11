package com.example.j2ee.dto.menu;

import com.example.j2ee.model.HanhDong;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho Action
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActionDTO {
    private String code;        // VIEW, CREATE, UPDATE
    private String label;       // "Xem", "Tạo mới"
    private String description; // "Xem/Đọc dữ liệu"

    public static ActionDTO fromEntity(HanhDong hanhDong) {
        return ActionDTO.builder()
                .code(hanhDong.getMaHanhDong())
                .label(getVietnameseLabel(hanhDong.getMaHanhDong()))
                .description(hanhDong.getMoTa())
                .build();
    }

    private static String getVietnameseLabel(String code) {
        return switch (code) {
            case "VIEW" -> "Xem";
            case "CREATE" -> "Tạo mới";
            case "UPDATE" -> "Cập nhật";
            case "DELETE" -> "Xóa";
            case "IMPORT" -> "Import";
            case "EXPORT" -> "Export";
            case "APPROVE" -> "Phê duyệt";
            case "CANCEL" -> "Hủy bỏ";
            case "RESTORE" -> "Khôi phục";
            case "MANAGE" -> "Quản lý toàn bộ";
            default -> code;
        };
    }
}
