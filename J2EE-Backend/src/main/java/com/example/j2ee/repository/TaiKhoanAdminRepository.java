package com.example.j2ee.repository;

import com.example.j2ee.model.TaiKhoanAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Đếm số tài khoản active có tên đăng nhập
     * Lưu ý: Soft deleted accounts đã có suffix _deleted_<id> nên không cần kiểm tra
     */
    @Query(value = "SELECT COUNT(*) FROM taikhoanadmin WHERE tendangnhap = :tenDangNhap AND da_xoa = 0", nativeQuery = true)
    Long countActiveByTenDangNhap(@Param("tenDangNhap") String tenDangNhap);

    /**
     * Kiểm tra tên đăng nhập có tồn tại trong các tài khoản active
     * Soft deleted accounts đã được đổi tên với suffix _deleted_<id>
     */
    default boolean existsByTenDangNhapIncludingDeleted(String tenDangNhap) {
        Long count = countActiveByTenDangNhap(tenDangNhap);
        return count != null && count > 0;
    }

    /**
     * Đếm số tài khoản active có email
     * Lưu ý: Soft deleted accounts đã có suffix _deleted_<id> nên không cần kiểm tra
     */
    @Query(value = "SELECT COUNT(*) FROM taikhoanadmin WHERE email = :email AND da_xoa = 0", nativeQuery = true)
    Long countActiveByEmail(@Param("email") String email);

    /**
     * Kiểm tra email có tồn tại trong các tài khoản active
     * Soft deleted accounts đã được đổi email với suffix _deleted_<id>
     */
    default boolean existsByEmailIncludingDeleted(String email) {
        Long count = countActiveByEmail(email);
        return count != null && count > 0;
    }

    /**
     * Đếm số tài khoản active có email, loại trừ ID hiện tại
     * Dùng cho việc update email
     */
    @Query(value = "SELECT COUNT(*) FROM taikhoanadmin WHERE email = :email AND da_xoa = 0 AND mataikhoan != :id", nativeQuery = true)
    Long countActiveByEmailExcludingId(@Param("email") String email, @Param("id") int id);

    /**
     * Kiểm tra email có tồn tại trong tài khoản active khác (loại trừ ID hiện tại)
     */
    default boolean existsByEmailExcludingId(String email, int id) {
        Long count = countActiveByEmailExcludingId(email, id);
        return count != null && count > 0;
    }

    /**
     * Tìm tất cả tài khoản admin bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM taikhoanadmin", nativeQuery = true)
    List<TaiKhoanAdmin> findAllIncludingDeleted();

    /**
     * Tìm tài khoản admin đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM taikhoanadmin WHERE mataikhoan = :id AND da_xoa = 1", nativeQuery = true)
    Optional<TaiKhoanAdmin> findDeletedById(@Param("id") int id);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM taikhoanadmin WHERE da_xoa = 1", nativeQuery = true)
    List<TaiKhoanAdmin> findAllDeleted();

    /**
     * Khôi phục tài khoản admin đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE taikhoanadmin SET da_xoa = 0, deleted_at = NULL WHERE mataikhoan = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM taikhoanadmin WHERE mataikhoan = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);

}
