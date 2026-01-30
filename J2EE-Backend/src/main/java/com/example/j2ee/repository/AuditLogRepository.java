package com.example.j2ee.repository;

import com.example.j2ee.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository cho AuditLog (Lịch sử thao tác)
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Tìm audit log theo loại thao tác
     */
    List<AuditLog> findByLoaiThaoTac(String loaiThaoTac);

    /**
     * Tìm audit log theo bảng ảnh hưởng
     */
    List<AuditLog> findByBangAnhHuong(String bangAnhHuong);

    /**
     * Tìm audit log theo ngưởi thực hiện
     */
    List<AuditLog> findByNguoiThucHienContainingIgnoreCase(String nguoiThucHien);

    /**
     * Tìm audit log theo loại tài khoản (ADMIN, CUSTOMER)
     */
    List<AuditLog> findByLoaiTaiKhoan(String loaiTaiKhoan);

    /**
     * Tìm audit log trong khoảng thờ gian
     */
    List<AuditLog> findByThoiGianBetween(LocalDateTime tuNgay, LocalDateTime denNgay);

    /**
     * Tìm kiếm audit log với nhiều điều kiện
     */
    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:loaiThaoTac IS NULL OR a.loaiThaoTac = :loaiThaoTac) AND " +
           "(:bangAnhHuong IS NULL OR a.bangAnhHuong = :bangAnhHuong) AND " +
           "(:loaiTaiKhoan IS NULL OR a.loaiTaiKhoan = :loaiTaiKhoan) AND " +
           "(:tuNgay IS NULL OR a.thoiGian >= :tuNgay) AND " +
           "(:denNgay IS NULL OR a.thoiGian <= :denNgay) AND " +
           "(:search IS NULL OR " +
           "   LOWER(a.moTa) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "   LOWER(a.nguoiThucHien) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "   LOWER(a.bangAnhHuong) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "   CAST(a.maLog AS string) LIKE CONCAT('%', :search, '%'))" +
           "ORDER BY a.thoiGian DESC")
    Page<AuditLog> searchAuditLogs(
            @Param("loaiThaoTac") String loaiThaoTac,
            @Param("bangAnhHuong") String bangAnhHuong,
            @Param("loaiTaiKhoan") String loaiTaiKhoan,
            @Param("tuNgay") LocalDateTime tuNgay,
            @Param("denNgay") LocalDateTime denNgay,
            @Param("search") String search,
            Pageable pageable);

    /**
     * Lấy danh sách các loại thao tác distinct
     */
    @Query("SELECT DISTINCT a.loaiThaoTac FROM AuditLog a ORDER BY a.loaiThaoTac")
    List<String> findDistinctLoaiThaoTac();

    /**
     * Lấy danh sách các bảng ảnh hưởng distinct
     */
    @Query("SELECT DISTINCT a.bangAnhHuong FROM AuditLog a ORDER BY a.bangAnhHuong")
    List<String> findDistinctBangAnhHuong();

    /**
     * Đếm số lượng audit log theo loại tài khoản
     */
    long countByLoaiTaiKhoan(String loaiTaiKhoan);

    /**
     * Đếm số lượng audit log trong ngày hôm nay
     */
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE DATE(a.thoiGian) = CURRENT_DATE")
    long countTodayLogs();
}
