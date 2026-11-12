package com.example.j2ee.repository;

import com.example.j2ee.model.HoanTien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HoanTienRepository extends JpaRepository<HoanTien, Integer>, JpaSpecificationExecutor<HoanTien> {
    
    /**
     * Tìm hoàn tiền theo mã đặt chỗ
     */
    List<HoanTien> findByDatCho_MaDatCho(int maDatCho);
    
    /**
     * Tìm hoàn tiền theo trạng thái
     */
    List<HoanTien> findByTrangThai(String trangThai);
    
    /**
     * Tìm hoàn tiền theo mã thanh toán
     */
    List<HoanTien> findByTrangThaiThanhToan_MaThanhToan(int maThanhToan);

    /**
     * Hoàn tiền đã xử lý, kèm ghế + đơn (PNR) để gom theo đơn khi export cho Odoo.
     */
    @Query("select h from HoanTien h join fetch h.datCho d join fetch d.donHang o "
            + "where h.trangThai = :status and (:since is null or h.ngayHoan > :since) order by h.ngayHoan")
    List<HoanTien> findRefundedForExport(@Param("status") String status, @Param("since") LocalDateTime since);

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Tìm tất cả hoàn tiền bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM hoantien", nativeQuery = true)
    List<HoanTien> findAllIncludingDeleted();

    /**
     * Tìm hoàn tiền đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM hoantien WHERE mahp = :id AND da_xoa = 1", nativeQuery = true)
    Optional<HoanTien> findDeletedById(@Param("id") int id);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM hoantien WHERE da_xoa = 1", nativeQuery = true)
    List<HoanTien> findAllDeleted();

    /**
     * Khôi phục hoàn tiền đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE hoantien SET da_xoa = 0, deleted_at = NULL WHERE mahp = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM hoantien WHERE mahp = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);
}
