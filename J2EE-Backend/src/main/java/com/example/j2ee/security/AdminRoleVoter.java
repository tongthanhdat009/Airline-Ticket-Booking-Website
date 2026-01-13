package com.example.j2ee.security;

import com.example.j2ee.service.AdminRoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDecisionVoter;
import org.springframework.security.access.ConfigAttribute;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.Set;

/**
 * Custom Voter để kiểm tra admin roles từ database
 * Cho phép truy cập nếu user có bất kỳ admin role nào
 */
@Slf4j
@RequiredArgsConstructor
public class AdminRoleVoter implements AccessDecisionVoter<Object> {

    private final AdminRoleService adminRoleService;

    @Override
    public int vote(Authentication authentication, Object object, Collection<ConfigAttribute> attributes) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ACCESS_DENIED;
        }

        // Lấy tất cả admin roles từ DB
        Set<String> adminRoles = adminRoleService.getAllActiveRoleNames();

        if (adminRoles.isEmpty()) {
            log.warn("No admin roles found in database");
            return ACCESS_DENIED;
        }

        // Kiểm tra user có bất kỳ admin role nào không
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            String authorityStr = authority.getAuthority();

            // Bỏ qua prefix ROLE_ nếu có
            String role = authorityStr.startsWith("ROLE_")
                    ? authorityStr.substring(5)
                    : authorityStr;

            if (adminRoles.contains(role)) {
                log.debug("User {} has admin role: {}", authentication.getName(), role);
                return ACCESS_GRANTED;
            }
        }

        log.debug("User {} does not have any admin role", authentication.getName());
        return ACCESS_DENIED;
    }

    @Override
    public boolean supports(ConfigAttribute attribute) {
        return true;
    }

    @Override
    public boolean supports(Class<?> clazz) {
        return true;
    }
}
