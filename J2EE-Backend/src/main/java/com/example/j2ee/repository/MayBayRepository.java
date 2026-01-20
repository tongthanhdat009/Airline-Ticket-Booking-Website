package com.example.j2ee.repository;

import com.example.j2ee.model.MayBay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MayBayRepository extends JpaRepository<MayBay, Integer> {
    
    /**
     * Tìm máy bay theo số hiệu
     */
    Optional<MayBay> findBySoHieu(String soHieu);

    /**
     * Kiểm tra máy bay tồn tại theo số hiệu
     */
    boolean existsBySoHieu(String soHieu);

    /**
     * Tìm máy bay theo trạng thái
     */
    List<MayBay> findByTrangThai(String trangThai);

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Tìm tất cả máy bay bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM maybay", nativeQuery = true)
    List<MayBay> findAllIncludingDeleted();

    /**
     * Tìm máy bay đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM maybay WHERE mamaybay = :id AND da_xoa = 1", nativeQuery = true)
    Optional<MayBay> findDeletedById(@Param("id") int id);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM maybay WHERE da_xoa = 1", nativeQuery = true)
    List<MayBay> findAllDeleted();

    /**
     * Khôi phục máy bay đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE maybay SET da_xoa = 0, deleted_at = NULL WHERE mamaybay = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM maybay WHERE mamaybay = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);
}
