package com.example.j2ee.repository;

import java.util.List;
import java.util.Optional;

import com.example.j2ee.model.DichVuCungCap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DichVuCungCapRepository extends JpaRepository<DichVuCungCap, Integer> {
    boolean existsByTenDichVu(String tenDichVu);
    @Query("SELECT dvcb.dichVuCungCap FROM DichVuChuyenBay dvcb WHERE dvcb.chiTietChuyenBay.maChuyenBay = :maChuyenBay")
    List<DichVuCungCap> findDichVuByChuyenBayId(@Param("maChuyenBay") int maChuyenBay);

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Tìm tất cả dịch vụ cung cấp bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM dichvucungcap", nativeQuery = true)
    List<DichVuCungCap> findAllIncludingDeleted();

    /**
     * Tìm dịch vụ cung cấp đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM dichvucungcap WHERE madichvu = :id AND da_xoa = 1", nativeQuery = true)
    Optional<DichVuCungCap> findDeletedById(@Param("id") int id);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM dichvucungcap WHERE da_xoa = 1", nativeQuery = true)
    List<DichVuCungCap> findAllDeleted();

    /**
     * Khôi phục dịch vụ cung cấp đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE dichvucungcap SET da_xoa = 0, deleted_at = NULL WHERE madichvu = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM dichvucungcap WHERE madichvu = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);
}
