package com.example.j2ee.repository;

import com.example.j2ee.model.KhuyenMai;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho KhuyenMai với support cho Lock để chống Race Condition
 */
public interface KhuyenMaiRepository extends JpaRepository<KhuyenMai, Integer> {
    
    /**
     * Tìm mã khuyến mãi bằng mã (khóa unique)
     */
    Optional<KhuyenMai> findByMaKM(String maKM);
    
    /**
     * Tìm mã khuyến mãi và lock row để chống Race Condition
     * Khi 100 người bấm "Áp dụng" cùng lúc, chỉ 1 người có thể lock row
     * Người tiếp theo sẽ phải chờ cho đến khi transaction hoàn thành
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT k FROM KhuyenMai k WHERE k.maKM = :maKM")
    Optional<KhuyenMai> findByMaKMWithLock(@Param("maKM") String maKM);
    
    /**
     * Kiểm tra mã khuyến mãi còn hiệu lực không
     */
    @Query("SELECT CASE WHEN k.trangThai = 'ACTIVE' AND CURRENT_TIMESTAMP BETWEEN k.ngayBatDau AND k.ngayKetThuc THEN true ELSE false END FROM KhuyenMai k WHERE k.maKM = :maKM")
    Boolean isActive(@Param("maKM") String maKM);
    
    /**
     * Kiểm tra mã khuyến mãi còn lượt dùng không
     */
    @Query("SELECT CASE WHEN k.soLuong IS NULL OR k.soLuongDaDuocDung < k.soLuong THEN true ELSE false END FROM KhuyenMai k WHERE k.maKM = :maKM")
    Boolean hasQuota(@Param("maKM") String maKM);

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Tìm tất cả khuyến mãi bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM khuyenmai", nativeQuery = true)
    List<KhuyenMai> findAllIncludingDeleted();

    /**
     * Tìm khuyến mãi đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM khuyenmai WHERE makhuyenmai = :id AND da_xoa = 1", nativeQuery = true)
    Optional<KhuyenMai> findDeletedById(@Param("id") int id);

    /**
     * Tìm khuyến mãi theo mã bao gồm cả đã xóa
     */
    @Query(value = "SELECT * FROM khuyenmai WHERE makm = :maKM", nativeQuery = true)
    Optional<KhuyenMai> findByMaKMIncludingDeleted(@Param("maKM") String maKM);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM khuyenmai WHERE da_xoa = 1", nativeQuery = true)
    List<KhuyenMai> findAllDeleted();

    /**
     * Khôi phục khuyến mãi đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE khuyenmai SET da_xoa = 0, deleted_at = NULL WHERE makhuyenmai = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM khuyenmai WHERE makhuyenmai = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);
}
