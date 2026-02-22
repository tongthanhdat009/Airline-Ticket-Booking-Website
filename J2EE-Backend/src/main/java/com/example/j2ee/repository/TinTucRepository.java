package com.example.j2ee.repository;

import java.util.List;
import java.util.Optional;

import com.example.j2ee.model.TinTuc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TinTucRepository extends JpaRepository<TinTuc, Integer> {

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Tìm tất cả tin tức bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM tin_tuc", nativeQuery = true)
    List<TinTuc> findAllIncludingDeleted();

    /**
     * Tìm tin tức đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM tin_tuc WHERE matintuc = :id AND da_xoa = 1", nativeQuery = true)
    Optional<TinTuc> findDeletedById(@Param("id") int id);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM tin_tuc WHERE da_xoa = 1", nativeQuery = true)
    List<TinTuc> findAllDeleted();

    /**
     * Khôi phục tin tức đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE tin_tuc SET da_xoa = 0, deleted_at = NULL WHERE matintuc = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM tin_tuc WHERE matintuc = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);
}
