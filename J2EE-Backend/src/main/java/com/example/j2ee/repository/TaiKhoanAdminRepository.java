package com.example.j2ee.repository;

import com.example.j2ee.model.TaiKhoanAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
// moi
@Repository
public interface TaiKhoanAdminRepository extends JpaRepository<TaiKhoanAdmin, Integer> {
    boolean existsByTenDangNhap(String tenDangNhap);
    boolean existsByEmail(String email);
    List<TaiKhoanAdmin> findByTenDangNhapContainingAndEmailContaining(String tenDangNhap, String email);
    List<TaiKhoanAdmin> findByTenDangNhapContaining(String tenDangNhap);
    List<TaiKhoanAdmin> findByEmailContaining(String email);

    Optional<TaiKhoanAdmin> findByTenDangNhap(String tenDangNhap);

}
