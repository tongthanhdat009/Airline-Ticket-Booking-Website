package com.example.j2ee.dto.menu;

import com.example.j2ee.model.ChucNang;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho Menu item với đầy đủ metadata UI
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemDTO {
    private Integer maChucNang;
    private String maCode;           // FLIGHT, CUSTOMER, etc.
    private String tenChucNang;      // "Quản lý chuyến bay"
    private String nhom;             // "Vận hành", "Bán vé", etc.
    private String routePath;        // "ChuyenBay", "KhachHang"
    private String uiIcon;           // "FaPlaneDeparture"
    private String uiColor;          // "from-orange-500 to-red-500"
    private String uiDescription;    // "Quản lý chuyến bay"
    private Integer displayOrder;    // Thứ tự hiển thị

    // Permission mà user cần để xem menu này (auto-generated)
    private String permissionKey;    // FLIGHT_VIEW

    public static MenuItemDTO fromEntity(ChucNang chucNang) {
        return MenuItemDTO.builder()
                .maChucNang(chucNang.getMaChucNang())
                .maCode(chucNang.getMaCode())
                .tenChucNang(chucNang.getTenChucNang())
                .nhom(chucNang.getNhom())
                .routePath(chucNang.getRoutePath())
                .uiIcon(chucNang.getUiIcon())
                .uiColor(chucNang.getUiColor())
                .uiDescription(chucNang.getUiDescription())
                .displayOrder(chucNang.getDisplayOrder() != null ? chucNang.getDisplayOrder() : 0)
                .permissionKey(chucNang.getMaCode() + "_VIEW")
                .build();
    }
}
