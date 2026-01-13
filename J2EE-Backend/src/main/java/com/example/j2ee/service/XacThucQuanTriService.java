    package com.example.j2ee.service;

    import com.example.j2ee.model.TaiKhoanAdmin;
    import com.example.j2ee.model.AdminVaiTro;
    import com.example.j2ee.model.VaiTro;
    import com.example.j2ee.repository.TaiKhoanAdminRepository;
    import com.example.j2ee.security.AdminUserDetails;
    import lombok.RequiredArgsConstructor;
    import org.springframework.security.core.userdetails.UserDetails;
    import org.springframework.security.core.userdetails.UserDetailsService;
    import org.springframework.security.core.userdetails.UsernameNotFoundException;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;

    import java.util.HashSet;
    import java.util.Set;
    import java.util.stream.Collectors;


    @Service("adminAccountDetailsService")
    @RequiredArgsConstructor
    public class XacThucQuanTriService implements UserDetailsService {

        private final TaiKhoanAdminRepository taiKhoanAdminRepository;
        private final PermissionService permissionService;


        @Override
        @Transactional(readOnly = true)
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
            TaiKhoanAdmin tk = taiKhoanAdminRepository.findByTenDangNhap(username)
                    .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy admin: " + username));

            // Lấy danh sách tên vai trò
            Set<String> roleNames = tk.getCacVaiTro().stream()
                    .map(av -> av.getVaiTro().getTenVaiTro())
                    .collect(Collectors.toSet());

            // Lấy danh sách permissions từ service
            Set<String> permissions = permissionService.getPermissionStrings(tk.getMaTaiKhoan());

            // Nếu không có vai trò nào, gán mặc định ROLE_ADMIN
            if (roleNames.isEmpty()) {
                roleNames.add("ADMIN");
            }

            // Tạo và trả về AdminUserDetails với đầy đủ thông tin
            return new AdminUserDetails(tk, roleNames, permissions);
        }
    }
