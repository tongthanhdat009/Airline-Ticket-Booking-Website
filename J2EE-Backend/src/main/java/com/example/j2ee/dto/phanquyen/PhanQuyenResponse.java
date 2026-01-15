package com.example.j2ee.dto.phanquyen;

import com.example.j2ee.model.ChucNang;
import com.example.j2ee.model.HanhDong;
import com.example.j2ee.model.PhanQuyen;
import com.example.j2ee.model.VaiTro;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * DTO cho response phân quyền
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhanQuyenResponse {
    
    private VaiTroInfo vaiTro;
    private List<PermissionDetail> permissions;
    private int totalPermissions;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VaiTroInfo {
        private int maVaiTro;
        private String tenVaiTro;
        private String moTa;
        private Boolean trangThai;
        private boolean isSuperAdmin;
        
        public static VaiTroInfo fromEntity(VaiTro vaiTro) {
            return VaiTroInfo.builder()
                    .maVaiTro(vaiTro.getMaVaiTro())
                    .tenVaiTro(vaiTro.getTenVaiTro())
                    .moTa(vaiTro.getMoTa())
                    .trangThai(vaiTro.getTrangThai())
                    .isSuperAdmin("SUPER_ADMIN".equals(vaiTro.getTenVaiTro()))
                    .build();
        }
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PermissionDetail {
        private int id;
        private int maVaiTro;
        private int maChucNang;
        private String maHanhDong;
        private String tenChucNang;
        private String maCodeChucNang;
        private String nhomChucNang;
        private String moTaHanhDong;
        
        public static PermissionDetail fromEntity(PhanQuyen pq, ChucNang cn, HanhDong hd) {
            return PermissionDetail.builder()
                    .id(pq.getId())
                    .maVaiTro(pq.getMaVaiTro())
                    .maChucNang(pq.getMaChucNang())
                    .maHanhDong(pq.getMaHanhDong())
                    .tenChucNang(cn != null ? cn.getTenChucNang() : null)
                    .maCodeChucNang(cn != null ? cn.getMaCode() : null)
                    .nhomChucNang(cn != null ? cn.getNhom() : null)
                    .moTaHanhDong(hd != null ? hd.getMoTa() : null)
                    .build();
        }
    }
}
