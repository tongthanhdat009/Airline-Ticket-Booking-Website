    package com.example.j2ee.service;

    import com.example.j2ee.model.TaiKhoanAdmin;
    import com.example.j2ee.model.AdminVaiTro;
    import com.example.j2ee.repository.TaiKhoanAdminRepository;
    import lombok.RequiredArgsConstructor;
    import org.springframework.security.core.authority.SimpleGrantedAuthority;
    import org.springframework.security.core.userdetails.UserDetails;
    import org.springframework.security.core.userdetails.UserDetailsService;
    import org.springframework.security.core.userdetails.UsernameNotFoundException;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;

    import java.util.List;
    import java.util.stream.Collectors;


    @Service("adminAccountDetailsService")
    @RequiredArgsConstructor
    public class XacThucQuanTriService implements UserDetailsService {

        private final TaiKhoanAdminRepository taiKhoanAdminRepository;


        @Override
        @Transactional(readOnly = true)
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
            TaiKhoanAdmin tk = taiKhoanAdminRepository.findByTenDangNhap(username)
                    .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy admin: " + username));

            // Lấy danh sách vai trò từ database
            List<SimpleGrantedAuthority> authorities = tk.getCacVaiTro().stream()
                    .map(AdminVaiTro::getVaiTro)
                    .map(vaiTro -> new SimpleGrantedAuthority("ROLE_" + vaiTro.getTenVaiTro()))
                    .collect(Collectors.toList());

            // Nếu không có vai trò nào, gán mặc định ROLE_ADMIN
            if (authorities.isEmpty()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            }

            return org.springframework.security.core.userdetails.User
                    .withUsername(tk.getTenDangNhap())
                    .password(tk.getMatKhauBam())
                    .authorities(authorities)
                    .build();

        }
    }
