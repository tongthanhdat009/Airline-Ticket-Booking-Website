package com.example.j2ee.repository;

import com.example.j2ee.model.HangVe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HangVeRepository extends JpaRepository<HangVe, Integer> {
    boolean existsByTenHangVe(String tenHangVe);

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Tìm tất cả hạng vé bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM hangve", nativeQuery = true)
    List<HangVe> findAllIncludingDeleted();

    /**
     * Tìm hạng vé đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM hangve WHERE mahangve = :id AND da_xoa = 1", nativeQuery = true)
    Optional<HangVe> findDeletedById(@Param("id") int id);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM hangve WHERE da_xoa = 1", nativeQuery = true)
    List<HangVe> findAllDeleted();

    /**
     * Khôi phục hạng vé đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE hangve SET da_xoa = 0, deleted_at = NULL WHERE mahangve = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM hangve WHERE mahangve = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);
}
