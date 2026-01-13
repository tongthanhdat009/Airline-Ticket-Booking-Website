package com.example.j2ee.repository;

import com.example.j2ee.model.LuaChonDichVu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LuaChonDichVuRepository extends JpaRepository<LuaChonDichVu, Integer> {
    List<LuaChonDichVu> findByDichVuCungCap_MaDichVu(int maDichVu);

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Tìm tất cả lựa chọn dịch vụ bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM luachondichvu", nativeQuery = true)
    List<LuaChonDichVu> findAllIncludingDeleted();

    /**
     * Tìm lựa chọn dịch vụ đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM luachondichvu WHERE maluachon = :id AND da_xoa = 1", nativeQuery = true)
    Optional<LuaChonDichVu> findDeletedById(@Param("id") int id);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM luachondichvu WHERE da_xoa = 1", nativeQuery = true)
    List<LuaChonDichVu> findAllDeleted();

    /**
     * Khôi phục lựa chọn dịch vụ đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE luachondichvu SET da_xoa = 0, deleted_at = NULL WHERE maluachon = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM luachondichvu WHERE maluachon = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);
}
