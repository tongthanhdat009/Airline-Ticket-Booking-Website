package com.example.j2ee.repository;

import com.example.j2ee.model.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository cho HoaDon
 */
@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, Integer>, JpaSpecificationExecutor<HoaDon> {

    /**
     * Tìm hóa đơn theo số hóa đơn
     */
    Optional<HoaDon> findBySoHoaDon(String soHoaDon);

    /**
     * Tìm hóa đơn theo mã đơn hàng
     */
    List<HoaDon> findByDonHang_MaDonHang(int maDonHang);

    /**
     * Tìm hóa đơn theo trạng thái
     */
    List<HoaDon> findByTrangThai(String trangThai);

    /**
     * Tìm hóa đơn theo khoảng thờ gian lập
     */
    List<HoaDon> findByNgayLapBetween(LocalDate tuNgay, LocalDate denNgay);

    /**
     * Tìm hóa đơn theo ngày hạch toán
     */
    List<HoaDon> findByNgayHachToanBetween(LocalDate tuNgay, LocalDate denNgay);

    /**
     * Tìm hóa đơn theo ngưởi lập
     */
    List<HoaDon> findByNguoiLapContainingIgnoreCase(String nguoiLap);

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Tìm tất cả hóa đơn bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM hoadon", nativeQuery = true)
    List<HoaDon> findAllIncludingDeleted();

    /**
     * Tìm hóa đơn đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM hoadon WHERE mahoadon = :id AND da_xoa = 1", nativeQuery = true)
    Optional<HoaDon> findDeletedById(@Param("id") int id);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM hoadon WHERE da_xoa = 1", nativeQuery = true)
    List<HoaDon> findAllDeleted();

    /**
     * Khôi phục hóa đơn đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE hoadon SET da_xoa = 0, deleted_at = NULL WHERE mahoadon = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM hoadon WHERE mahoadon = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);

    /**
     * Tạo số hóa đơn tiếp theo theo pattern HD{YYYY}{NNNN}
     */
    @Query(value = "SELECT COUNT(*) FROM hoadon WHERE sohoadon LIKE CONCAT('HD', YEAR(CURDATE()), '%')", nativeQuery = true)
    long countHoaDonInCurrentYear();
}
