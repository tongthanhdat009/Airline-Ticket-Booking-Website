package com.example.j2ee.security;

import com.example.j2ee.model.TaiKhoanAdmin;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Custom UserDetails implementation cho Admin
 * Chứa thông tin đầy đủ về taiKhoanAdmin, các vai trò và permissions
 */
@Getter
public class AdminUserDetails implements UserDetails {

    private final TaiKhoanAdmin taiKhoanAdmin;
    private final Set<String> roles; // Set of role names (e.g., "SUPER_ADMIN", "QUAN_LY")
    private final Set<String> permissions; // Set of permissions (e.g., "FLIGHT_VIEW", "FLIGHT_CREATE")
    private final Set<GrantedAuthority> authorities;

    public AdminUserDetails(
            TaiKhoanAdmin taiKhoanAdmin,
            Set<String> roles,
            Set<String> permissions) {
        this.taiKhoanAdmin = taiKhoanAdmin;
        this.roles = roles;
        this.permissions = permissions;

        // Build authorities from both roles and permissions
        this.authorities = new HashSet<>();

        // Add role authorities with ROLE_ prefix
        roles.forEach(role -> authorities.add(new SimpleGrantedAuthority("ROLE_" + role)));

        // Add permission authorities
        permissions.forEach(permission -> authorities.add(new SimpleGrantedAuthority(permission)));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return taiKhoanAdmin.getMatKhauBam();
    }

    @Override
    public String getUsername() {
        return taiKhoanAdmin.getTenDangNhap();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true; // Có thể thêm logic kiểm tra trạng thái từ DB nếu cần
    }

    /**
     * Kiểm tra xem admin có vai trò cụ thể không
     */
    public boolean hasRole(String roleName) {
        return roles.contains(roleName);
    }

    /**
     * Kiểm tra xem admin có quyền cụ thể không
     * Lưu ý: MANAGE bao gồm tất cả actions (VIEW, CREATE, UPDATE, DELETE, EXPORT,
     * APPROVE...)
     */
    public boolean hasPermission(String permission) {
        // Kiểm tra trực tiếp
        if (permissions.contains(permission)) {
            return true;
        }

        // Kiểm tra nếu có quyền MANAGE trên feature thì có tất cả actions
        // permission format: FEATURE_ACTION (e.g., REPORT_VIEW, FLIGHT_CREATE)
        int underscoreIndex = permission.lastIndexOf('_');
        if (underscoreIndex > 0) {
            String feature = permission.substring(0, underscoreIndex);
            String managePermission = feature + "_MANAGE";
            if (permissions.contains(managePermission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Kiểm tra xem admin có bất kỳ vai trò nào không
     */
    public boolean hasAnyRole(String... roleNames) {
        return roles.stream().anyMatch(r -> {
            for (String roleName : roleNames) {
                if (r.equals(roleName)) {
                    return true;
                }
            }
            return false;
        });
    }

    /**
     * Lấy danh sách roles dạng string (có ROLE_ prefix)
     */
    public Set<String> getRoleStrings() {
        return roles.stream()
                .map(role -> "ROLE_" + role)
                .collect(Collectors.toSet());
    }
}
