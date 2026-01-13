package com.example.j2ee.util;

import com.example.j2ee.security.AdminUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Set;

/**
 * Utility class để hỗ trợ kiểm tra security trong controllers
 */
public class SecurityUtil {

    /**
     * Lấy Authentication hiện tại
     */
    public static Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    /**
     * Lấy username của user đang đăng nhập
     */
    public static String getCurrentUsername() {
        Authentication auth = getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getName();
        }
        return null;
    }

    /**
     * Kiểm tra user đã đăng nhập chưa
     */
    public static boolean isAuthenticated() {
        Authentication auth = getAuthentication();
        return auth != null && auth.isAuthenticated() &&
               !"anonymousUser".equals(auth.getName());
    }

    /**
     * Lấy AdminUserDetails nếu user là admin
     */
    public static AdminUserDetails getAdminUserDetails() {
        Authentication auth = getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AdminUserDetails) {
            return (AdminUserDetails) auth.getPrincipal();
        }
        return null;
    }

    /**
     * Kiểm tra user hiện tại có phải là admin không
     */
    public static boolean isAdmin() {
        return getAdminUserDetails() != null;
    }

    /**
     * Kiểm tra admin hiện tại có role cụ thể không
     */
    public static boolean hasRole(String roleName) {
        AdminUserDetails adminUser = getAdminUserDetails();
        return adminUser != null && adminUser.hasRole(roleName);
    }

    /**
     * Kiểm tra admin hiện tại có bất kỳ role nào trong danh sách không
     */
    public static boolean hasAnyRole(String... roleNames) {
        AdminUserDetails adminUser = getAdminUserDetails();
        return adminUser != null && adminUser.hasAnyRole(roleNames);
    }

    /**
     * Kiểm tra admin hiện tại có permission cụ thể không
     */
    public static boolean hasPermission(String permission) {
        AdminUserDetails adminUser = getAdminUserDetails();
        return adminUser != null && adminUser.hasPermission(permission);
    }

    /**
     * Kiểm tra admin hiện tại có permission cụ thể không (feature + action)
     */
    public static boolean hasPermission(String feature, String action) {
        return hasPermission(feature + "_" + action);
    }

    /**
     * Lấy danh sách roles của admin hiện tại
     */
    public static Set<String> getCurrentRoles() {
        AdminUserDetails adminUser = getAdminUserDetails();
        return adminUser != null ? adminUser.getRoles() : Set.of();
    }

    /**
     * Lấy danh sách permissions của admin hiện tại
     */
    public static Set<String> getCurrentPermissions() {
        AdminUserDetails adminUser = getAdminUserDetails();
        return adminUser != null ? adminUser.getPermissions() : Set.of();
    }

    /**
     * Lấy ID của admin hiện tại
     */
    public static Integer getCurrentAdminId() {
        AdminUserDetails adminUser = getAdminUserDetails();
        return adminUser != null ? adminUser.getTaiKhoanAdmin().getMaTaiKhoan() : null;
    }
}
