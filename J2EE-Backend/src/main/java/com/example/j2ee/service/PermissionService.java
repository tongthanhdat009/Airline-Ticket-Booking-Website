package com.example.j2ee.service;

import com.example.j2ee.model.TaiKhoanAdmin;
import com.example.j2ee.model.VaiTro;
import com.example.j2ee.model.ChucNang;
import com.example.j2ee.repository.TaiKhoanAdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service xử lý logic liên quan đến phân quyền
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PermissionService {

    private final TaiKhoanAdminRepository taiKhoanAdminRepository;

    /**
     * Lấy danh sách tên vai trò của admin
     */
    @Transactional(readOnly = true)
    public Set<String> getRoleNames(int maTaiKhoan) {
        TaiKhoanAdmin admin = taiKhoanAdminRepository.findById(maTaiKhoan)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy admin với ID: " + maTaiKhoan));

        return admin.getCacVaiTro().stream()
                .map(av -> av.getVaiTro().getTenVaiTro())
                .collect(Collectors.toSet());
    }

    /**
     * Lấy danh sách permissions của admin dưới dạng string
     * Format: {MA_CHUC_NANG}_{MA_HANH_DONG}
     * Ví dụ: FLIGHT_VIEW, FLIGHT_CREATE, BOOKING_CANCEL
     */
    @Transactional(readOnly = true)
    public Set<String> getPermissionStrings(int maTaiKhoan) {
        TaiKhoanAdmin admin = taiKhoanAdminRepository.findById(maTaiKhoan)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy admin với ID: " + maTaiKhoan));

        Set<String> permissions = new HashSet<>();

        // Lấy tất cả vai trò của admin
        admin.getCacVaiTro().forEach(adminVaiTro -> {
            VaiTro vaiTro = adminVaiTro.getVaiTro();

            // Lấy tất cả phân quyền của vai trò
            if (vaiTro.getCacPhanQuyen() != null) {
                vaiTro.getCacPhanQuyen().forEach(phanQuyen -> {
                    ChucNang chucNang = phanQuyen.getChucNang();
                    String maHanhDong = phanQuyen.getMaHanhDong();

                    // Tạo permission string: MA_CHUC_NANG + "_" + MA_HANH_DONG
                    if (chucNang != null && maHanhDong != null) {
                        String permission = chucNang.getMaCode() + "_" + maHanhDong;
                        permissions.add(permission);

                        log.debug("Permission: {} for role: {}", permission, vaiTro.getTenVaiTro());
                    }
                });
            }
        });

        return permissions;
    }

    /**
     * Kiểm tra admin có quyền cụ thể không
     */
    @Transactional(readOnly = true)
    public boolean hasPermission(int maTaiKhoan, String featureCode, String action) {
        Set<String> permissions = getPermissionStrings(maTaiKhoan);
        String requiredPermission = featureCode + "_" + action;
        return permissions.contains(requiredPermission);
    }

    /**
     * Kiểm tra admin có bất kỳ quyền nào trong danh sách không
     */
    @Transactional(readOnly = true)
    public boolean hasAnyPermission(int maTaiKhoan, List<String> requiredPermissions) {
        Set<String> permissions = getPermissionStrings(maTaiKhoan);
        return requiredPermissions.stream().anyMatch(permissions::contains);
    }

    /**
     * Lấy tất cả permissions của admin
     * @return Set chứa các permissions string
     */
    @Transactional(readOnly = true)
    public Set<String> getAllPermissions(int maTaiKhoan) {
        return getPermissionStrings(maTaiKhoan);
    }

    /**
     * Lấy tất cả roles của admin
     * @return Set chứa tên các vai trò
     */
    @Transactional(readOnly = true)
    public Set<String> getAllRoles(int maTaiKhoan) {
        return getRoleNames(maTaiKhoan);
    }

    /**
     * Kiểm tra admin có vai trò cụ thể không
     */
    @Transactional(readOnly = true)
    public boolean hasRole(int maTaiKhoan, String roleName) {
        Set<String> roles = getRoleNames(maTaiKhoan);
        return roles.stream().anyMatch(role -> role.equalsIgnoreCase(roleName));
    }

    /**
     * Kiểm tra admin có bất kỳ vai trò nào trong danh sách không
     */
    @Transactional(readOnly = true)
    public boolean hasAnyRole(int maTaiKhoan, String... roleNames) {
        Set<String> roles = getRoleNames(maTaiKhoan);
        return roles.stream().anyMatch(role -> {
            for (String roleName : roleNames) {
                if (role.equalsIgnoreCase(roleName)) {
                    return true;
                }
            }
            return false;
        });
    }
}
