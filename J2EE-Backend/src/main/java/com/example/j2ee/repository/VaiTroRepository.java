package com.example.j2ee.repository;

import com.example.j2ee.model.VaiTro;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VaiTroRepository extends JpaRepository<VaiTro, Integer> {
    VaiTro findByMaVaiTro(int maVaiTro);

    Optional<VaiTro> findByTenVaiTro(String tenVaiTro);

    List<VaiTro> findByTrangThai(Boolean trangThai);

    boolean existsByTenVaiTro(String tenVaiTro);

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Tìm tất cả vai trò bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM vai_tro", nativeQuery = true)
    List<VaiTro> findAllIncludingDeleted();

    /**
     * Tìm vai trò đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM vai_tro WHERE ma_vai_tro = :id AND da_xoa = 1", nativeQuery = true)
    Optional<VaiTro> findDeletedById(@Param("id") int id);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM vai_tro WHERE da_xoa = 1", nativeQuery = true)
    List<VaiTro> findAllDeleted();

    /**
     * Khôi phục vai trò đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE vai_tro SET da_xoa = 0, deleted_at = NULL WHERE ma_vai_tro = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM vai_tro WHERE ma_vai_tro = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);
}
