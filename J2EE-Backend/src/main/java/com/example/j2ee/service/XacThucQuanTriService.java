    package com.example.j2ee.service;

    import com.example.j2ee.model.TaiKhoanAdmin;
    import com.example.j2ee.repository.TaiKhoanAdminRepository;
    import lombok.RequiredArgsConstructor;
    import org.springframework.security.core.userdetails.UserDetails;
    import org.springframework.security.core.userdetails.UserDetailsService;
    import org.springframework.security.core.userdetails.UsernameNotFoundException;
    import org.springframework.stereotype.Service;


    @Service("adminAccountDetailsService")
    @RequiredArgsConstructor
    public class XacThucQuanTriService implements UserDetailsService {

        private final TaiKhoanAdminRepository taiKhoanAdminRepository;


        @Override
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
            TaiKhoanAdmin tk = taiKhoanAdminRepository.findByTenDangNhap(username)
                    .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy admin: " + username));

            return org.springframework.security.core.userdetails.User
                    .withUsername(tk.getTenDangNhap())
                    .password(tk.getMatKhauBam()) // BCrypt hash
                    .authorities("ROLE_ADMIN")
                    .build();

        }
    }
