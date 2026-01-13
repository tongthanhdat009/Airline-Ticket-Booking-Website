package com.example.j2ee.security;

import com.example.j2ee.service.AdminRoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.function.Supplier;

/**
 * Dynamic AuthorizationManager để kiểm tra admin roles từ database
 * Sử dụng Spring Security 6 AuthorizationManager API (thay thế deprecated AccessDecisionVoter)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DynamicAdminAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {

    private final AdminRoleService adminRoleService;

    @Override
    public AuthorizationDecision check(Supplier<Authentication> authentication, RequestAuthorizationContext object) {
        Authentication auth = authentication.get();

        if (auth == null || !auth.isAuthenticated()) {
            log.debug("Authentication is null or not authenticated");
            return new AuthorizationDecision(false);
        }

        // Lấy tất cả admin roles từ DB (với cache)
        Set<String> adminRoles = adminRoleService.getAllActiveRoleNames();

        if (adminRoles.isEmpty()) {
            log.warn("No admin roles found in database");
            return new AuthorizationDecision(false);
        }

        // Kiểm tra user có bất kỳ admin role nào không
        for (GrantedAuthority authority : auth.getAuthorities()) {
            String authorityStr = authority.getAuthority();

            // Bỏ qua prefix ROLE_ nếu có
            String role = authorityStr.startsWith("ROLE_")
                    ? authorityStr.substring(5)
                    : authorityStr;

            if (adminRoles.contains(role)) {
                log.debug("User {} has admin role: {}", auth.getName(), role);
                return new AuthorizationDecision(true);
            }
        }

        log.debug("User {} does not have any admin role. User authorities: {}",
                auth.getName(), auth.getAuthorities());
        return new AuthorizationDecision(false);
    }
}
