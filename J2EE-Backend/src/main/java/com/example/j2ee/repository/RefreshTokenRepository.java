package com.example.j2ee.repository;

import com.example.j2ee.model.RefreshToken;
import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.model.TaiKhoanAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /**
     * Tìm refresh token bằng token string
     */
    Optional<RefreshToken> findByTokenAndDaXoa(String token, boolean daXoa);

    /**
     * Tìm tất cả refresh token của một tài khoản khách hàng (chưa bị xóa)
     */
    List<RefreshToken> findByTaiKhoanAndDaXoa(TaiKhoan taiKhoan, boolean daXoa);

    /**
     * Tìm tất cả refresh token của một tài khoản admin (chưa bị xóa)
     */
    List<RefreshToken> findByTaiKhoanAdminAndDaXoa(TaiKhoanAdmin taiKhoanAdmin, boolean daXoa);

    /**
     * Tìm tất cả refresh token đã hết hạn và chưa bị xóa
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.ngayHetHan < :currentTime AND rt.daXoa = false")
    List<RefreshToken> findExpiredTokens(@Param("currentTime") LocalDateTime currentTime);

    /**
     * Đánh dấu tất cả refresh token của một tài khoản khách hàng là đã xóa
     */
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.daXoa = true WHERE rt.taiKhoan = :taiKhoan")
    void revokeAllByTaiKhoan(@Param("taiKhoan") TaiKhoan taiKhoan);

    /**
     * Đánh dấu tất cả refresh token của một tài khoản admin là đã xóa
     */
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.daXoa = true WHERE rt.taiKhoanAdmin = :taiKhoanAdmin")
    void revokeAllByTaiKhoanAdmin(@Param("taiKhoanAdmin") TaiKhoanAdmin taiKhoanAdmin);

    /**
     * Xóa hard delete tất cả refresh token đã bị soft delete và hết hạn
     */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.daXoa = true AND rt.ngayHetHan < :currentTime")
    void deleteExpiredRevokedTokens(@Param("currentTime") LocalDateTime currentTime);

    /**
     * Kiểm tra token có tồn tại và hợp lệ (chưa xóa, chưa hết hạn)
     */
    @Query("SELECT CASE WHEN COUNT(rt) > 0 THEN true ELSE false END FROM RefreshToken rt " +
           "WHERE rt.token = :token AND rt.daXoa = false AND rt.ngayHetHan > :currentTime")
    boolean existsValidToken(@Param("token") String token, @Param("currentTime") LocalDateTime currentTime);
}
