package com.example.j2ee.dto.phanquyen;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * DTO cho request cập nhật phân quyền
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PhanQuyenRequest {
    
    private int maVaiTro;
    
    /**
     * Danh sách các permission cần cấp cho vai trò
     * Mỗi item có format: { maChucNang, maHanhDong }
     */
    private List<PermissionItem> permissions;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PermissionItem {
        private int maChucNang;
        private String maHanhDong;
    }
}
