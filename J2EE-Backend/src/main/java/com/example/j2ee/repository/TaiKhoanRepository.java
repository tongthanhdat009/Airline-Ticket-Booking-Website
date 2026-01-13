package com.example.j2ee.repository;

import com.example.j2ee.model.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Integer> {
    // Kiểm tra xem email đã tồn tại trong bảng tài khoản chưa
    boolean existsByEmail(String email);

    // Tìm tài khoản bằng email
    Optional<TaiKhoan> findByEmail(String email);

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Tìm tất cả tài khoản bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM taikhoan", nativeQuery = true)
    List<TaiKhoan> findAllIncludingDeleted();

    /**
     * Tìm tài khoản đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM taikhoan WHERE mataikhoan = :id AND da_xoa = 1", nativeQuery = true)
    Optional<TaiKhoan> findDeletedById(@Param("id") int id);

    /**
     * Tìm tài khoản theo email bao gồm cả đã xóa
     */
    @Query(value = "SELECT * FROM taikhoan WHERE email = :email", nativeQuery = true)
    Optional<TaiKhoan> findByEmailIncludingDeleted(@Param("email") String email);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM taikhoan WHERE da_xoa = 1", nativeQuery = true)
    List<TaiKhoan> findAllDeleted();

    /**
     * Khôi phục tài khoản đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE taikhoan SET da_xoa = 0, deleted_at = NULL WHERE mataikhoan = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM taikhoan WHERE mataikhoan = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);


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
