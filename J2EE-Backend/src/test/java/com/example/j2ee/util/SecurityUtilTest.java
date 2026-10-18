package com.example.j2ee.util;

import com.example.j2ee.model.HanhKhach;
import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.security.AdminUserDetails;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit test cho ownership helpers fix D-9/D-10 (IDOR).
 */
class SecurityUtilTest {

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private void loginAsCustomer(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, null, List.of()));
    }

    private HanhKhach passenger(String hkEmail, String accountEmail) {
        HanhKhach hk = new HanhKhach();
        hk.setEmail(hkEmail);
        if (accountEmail != null) {
            TaiKhoan tk = new TaiKhoan();
            tk.setEmail(accountEmail);
            hk.setTaiKhoan(tk);
        }
        return hk;
    }

    @Test
    void anonymous_hasNoCustomerEmail() {
        SecurityContextHolder.getContext().setAuthentication(
                new AnonymousAuthenticationToken("key", "anonymousUser",
                        List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS"))));
        assertNull(SecurityUtil.getCurrentCustomerEmail());
        assertFalse(SecurityUtil.isSelf("a@x.com"));
        assertFalse(SecurityUtil.isOwnerOf(passenger("a@x.com", null)));
    }

    @Test
    void noContext_deniesEverything() {
        SecurityContextHolder.clearContext();
        assertNull(SecurityUtil.getCurrentCustomerEmail());
        assertFalse(SecurityUtil.isSelf("a@x.com"));
    }

    @Test
    void admin_isNotCustomer() {
        AdminUserDetails admin = AdminUserDetails.fromToken(
                "admin", 1, Set.of("SUPER_ADMIN"), Set.of("USER_VIEW"));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities()));
        assertNull(SecurityUtil.getCurrentCustomerEmail());
        assertFalse(SecurityUtil.isSelf("a@x.com"));
    }

    @Test
    void customer_matchesOwnEmailCaseInsensitive() {
        loginAsCustomer("Me@X.com");
        assertEquals("Me@X.com", SecurityUtil.getCurrentCustomerEmail());
        assertTrue(SecurityUtil.isSelf("me@x.com"));
        assertFalse(SecurityUtil.isSelf("other@x.com"));
    }

    @Test
    void ownerViaLinkedAccount() {
        loginAsCustomer("me@x.com");
        // Dù email hành khách khác, link tài khoản quyết định.
        assertTrue(SecurityUtil.isOwnerOf(passenger("other@x.com", "me@x.com")));
        assertFalse(SecurityUtil.isOwnerOf(passenger("me@x.com", "other@x.com")));
    }

    @Test
    void ownerViaPassengerEmailForGuestBooking() {
        loginAsCustomer("me@x.com");
        assertTrue(SecurityUtil.isOwnerOf(passenger("me@x.com", null)));
        assertFalse(SecurityUtil.isOwnerOf(passenger("guest@x.com", null)));
    }
}
