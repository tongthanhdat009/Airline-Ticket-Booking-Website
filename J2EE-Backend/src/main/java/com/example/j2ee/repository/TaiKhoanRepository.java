package com.example.j2ee.repository;

import com.example.j2ee.model.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Integer> {
    // Kiểm tra xem email đã tồn tại trong bảng tài khoản chưa
    boolean existsByEmail(String email);

    // Tìm tài khoản bằng email
    Optional<TaiKhoan> findByEmail(String email);


    // Truy xuất thông tin cá nhân
    @Query(value = """
    SELECT 
        tk.email    AS email,
        hk.hovaten  AS hovaten,
        hk.ngaysinh AS ngaysinh,
        hk.gioitinh AS gioitinh,
        hk.sodienthoai AS sodienthoai,
        hk.madinhdanh AS madinhdanh,
        hk.diachi AS diachi,
        hk.quocgia AS quocgia
    FROM taikhoan tk
    JOIN hanhkhach hk ON hk.mahanhkhach = tk.mahanhkhach
    WHERE tk.email = :email
    LIMIT 1
    """, nativeQuery = true)
    java.util.List<Object[]> findEmailAndNameByEmail(@Param("email") String email);
}
