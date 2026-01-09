package com.example.j2ee.service;

import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;

@Service("userAccountDetailsService")
@RequiredArgsConstructor
public class XacThucNguoiDungService implements UserDetailsService {

    private final TaiKhoanRepository taiKhoanRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        TaiKhoan tk = taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy email: " + email));

        return org.springframework.security.core.userdetails.User
                .withUsername(tk.getEmail())
                .password(tk.getMatKhauBam()) // BCrypt hash
                .authorities("ROLE_USER")
                .build();
    }

}
