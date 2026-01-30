package com.example.j2ee.aspect;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.annotation.RequireRole;
import com.example.j2ee.security.AdminUserDetails;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.FORBIDDEN;

/**
 * Aspect để xử lý kiểm tra permissions và roles
 * Intercepts các method được đánh dấu với @RequirePermission hoặc @RequireRole
 */
@Aspect
@Component
@Slf4j
public class PermissionAspect {

    /**
     * Kiểm tra @RequireRole annotation
     * User phải có ít nhất một role trong danh sách yêu cầu
     */
    @Before("@within(requireRole) || @annotation(requireRole)")
    public void checkRole(JoinPoint joinPoint, RequireRole requireRole) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(FORBIDDEN, "Chưa đăng nhập");
        }

        // Lấy danh sách roles yêu cầu
        String[] requiredRoles = requireRole.value();

        // Kiểm tra nếu principal là AdminUserDetails
        if (auth.getPrincipal() instanceof AdminUserDetails) {
            AdminUserDetails adminUser = (AdminUserDetails) auth.getPrincipal();

            // Kiểm tra xem admin có bất kỳ role nào trong danh sách không
            boolean hasAnyRole = adminUser.hasAnyRole(requiredRoles);

            if (!hasAnyRole) {
                log.warn("User {} không có các role yêu cầu: {}",
                        adminUser.getUsername(), String.join(", ", requiredRoles));
                throw new ResponseStatusException(FORBIDDEN,
                        "Yêu cầu một trong các vai trò: " + String.join(", ", requiredRoles));
            }

            log.debug("User {} có role phù hợp cho: {}",
                    adminUser.getUsername(), joinPoint.getSignature().toShortString());
            return;
        }

        // Nếu không phải AdminUserDetails, kiểm tra authorities
        boolean hasAnyRole = auth.getAuthorities().stream()
                .anyMatch(grantedAuthority -> {
                    String authority = grantedAuthority.getAuthority();
                    for (String requiredRole : requiredRoles) {
                        if (authority.equals("ROLE_" + requiredRole) ||
                                authority.equals(requiredRole)) {
                            return true;
                        }
                    }
                    return false;
                });

        if (!hasAnyRole) {
            log.warn("User {} không có các role yêu cầu: {}", auth.getName(), String.join(", ", requiredRoles));
            throw new ResponseStatusException(FORBIDDEN,
                    "Yêu cầu một trong các vai trò: " + String.join(", ", requiredRoles));
        }

        log.debug("User {} có role phù hợp", auth.getName());
    }

    /**
     * Kiểm tra @RequirePermission annotation
     * User phải có permission cụ thể (feature_action)
     */
    @Before("@within(requirePermission) || @annotation(requirePermission)")
    public void checkPermission(JoinPoint joinPoint, RequirePermission requirePermission) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(FORBIDDEN, "Chưa đăng nhập");
        }

        // SUPER_ADMIN bypass: bỏ qua tất cả permission check
        if (auth.getPrincipal() instanceof AdminUserDetails) {
            AdminUserDetails adminUser = (AdminUserDetails) auth.getPrincipal();
            if (adminUser.hasRole("SUPER_ADMIN")) {
                log.debug("SUPER_ADMIN bypass cho user {}: {}",
                        adminUser.getUsername(), joinPoint.getSignature().toShortString());
                return;
            }
        }

        String feature = requirePermission.feature();
        String action = requirePermission.action();
        String requiredPermission = feature + "_" + action;

        // Kiểm tra nếu principal là AdminUserDetails
        if (auth.getPrincipal() instanceof AdminUserDetails) {
            AdminUserDetails adminUser = (AdminUserDetails) auth.getPrincipal();

            if (!adminUser.hasPermission(requiredPermission)) {
                log.warn("User {} không có permission yêu cầu: {} (roles: {})",
                        adminUser.getUsername(), requiredPermission, adminUser.getRoles());
                throw new ResponseStatusException(FORBIDDEN,
                        "Yêu cầu quyền: " + requiredPermission);
            }

            log.debug("User {} có permission {} cho: {}",
                    adminUser.getUsername(), requiredPermission, joinPoint.getSignature().toShortString());
            return;
        }

        // Nếu không phải AdminUserDetails, kiểm tra authorities
        boolean hasPermission = auth.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals(requiredPermission));

        if (!hasPermission) {
            log.warn("User {} không có permission yêu cầu: {}", auth.getName(), requiredPermission);
            throw new ResponseStatusException(FORBIDDEN,
                    "Yêu cầu quyền: " + requiredPermission);
        }

        log.debug("User {} có permission {}", auth.getName(), requiredPermission);
    }
}
