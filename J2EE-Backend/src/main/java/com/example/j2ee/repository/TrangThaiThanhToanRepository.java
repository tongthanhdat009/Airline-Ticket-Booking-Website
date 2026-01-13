package com.example.j2ee.repository;

import com.example.j2ee.model.TrangThaiThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrangThaiThanhToanRepository extends JpaRepository<TrangThaiThanhToan, Integer> {
    
    // Tìm thanh toán theo trạng thái (Y = đã thanh toán, N = đang xử lý)
    List<TrangThaiThanhToan> findByDaThanhToan(char daThanhToan);
    
    // Tìm thanh toán theo mã đặt chỗ
    TrangThaiThanhToan findByDatCho_MaDatCho(int maDatCho);

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Tìm tất cả thanh toán bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM trangthaithanhtoan", nativeQuery = true)
    List<TrangThaiThanhToan> findAllIncludingDeleted();

    /**
     * Tìm thanh toán đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM trangthaithanhtoan WHERE mathanhtoan = :id AND da_xoa = 1", nativeQuery = true)
    Optional<TrangThaiThanhToan> findDeletedById(@Param("id") int id);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM trangthaithanhtoan WHERE da_xoa = 1", nativeQuery = true)
    List<TrangThaiThanhToan> findAllDeleted();

    /**
     * Khôi phục thanh toán đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE trangthaithanhtoan SET da_xoa = 0, deleted_at = NULL WHERE mathanhtoan = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM trangthaithanhtoan WHERE mathanhtoan = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);
}
