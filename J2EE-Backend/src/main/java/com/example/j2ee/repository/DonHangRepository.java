package com.example.j2ee.repository;

import com.example.j2ee.model.DonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonHangRepository extends JpaRepository<DonHang, Integer>, JpaSpecificationExecutor<DonHang> {

    /**
     * Tìm đơn hàng theo mã PNR
     */
    Optional<DonHang> findByPnr(String pnr);

    /**
     * Tìm đơn hàng theo mã PNR (không phân biệt hoa thường)
     */
    Optional<DonHang> findByPnrIgnoreCase(String pnr);

    /**
     * Kiểm tra xem PNR đã tồn tại chưa
     */
    boolean existsByPnr(String pnr);

    /**
     * Tìm đơn hàng theo email người đặt
     */
    List<DonHang> findByEmailNguoiDat(String email);

    /**
     * Tìm đơn hàng theo email người đặt và trạng thái
     */
    List<DonHang> findByEmailNguoiDatAndTrangThai(String email, String trangThai);

    /**
     * Tìm đơn hàng theo số điện thoại người đặt
     */
    List<DonHang> findBySoDienThoaiNguoiDat(String soDienThoai);

    /**
     * Tìm đơn hàng theo hành khách người đặt
     */
    List<DonHang> findByHanhKhachNguoiDat_MaHanhKhach(int maHanhKhach);

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Tìm tất cả đơn hàng bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM donhang", nativeQuery = true)
    List<DonHang> findAllIncludingDeleted();

    /**
     * Tìm đơn hàng đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM donhang WHERE madonhang = :id AND da_xoa = 1", nativeQuery = true)
    Optional<DonHang> findDeletedById(@Param("id") int id);

    /**
     * Tìm đơn hàng theo PNR bao gồm cả đã xóa
     */
    @Query(value = "SELECT * FROM donhang WHERE pnr = :pnr", nativeQuery = true)
    Optional<DonHang> findByPnrIncludingDeleted(@Param("pnr") String pnr);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM donhang WHERE da_xoa = 1", nativeQuery = true)
    List<DonHang> findAllDeleted();

    /**
     * Khôi phục đơn hàng đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE donhang SET da_xoa = 0, deleted_at = NULL WHERE madonhang = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM donhang WHERE madonhang = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);
}
