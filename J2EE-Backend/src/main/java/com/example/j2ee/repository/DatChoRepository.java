package com.example.j2ee.repository;

import com.example.j2ee.model.DatCho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface DatChoRepository extends JpaRepository<DatCho, Integer> {

    // Tìm đặt chỗ theo đơn hàng
    List<DatCho> findByDonHang_MaDonHang(int maDonHang);

    // Tìm đặt chỗ theo hành khách
    List<DatCho> findByHanhKhach_MaHanhKhach(int maHanhKhach);
    
    // Tìm đặt chỗ theo ghế
    DatCho findByChiTietGhe_MaGhe(int maGhe);
    
    // Tìm đặt chỗ theo mã đặt chỗ và tên hành khách
    @Query("SELECT dc FROM DatCho dc WHERE dc.maDatCho = :maDatCho AND LOWER(dc.hanhKhach.hoVaTen) LIKE LOWER(CONCAT('%', :tenHanhKhach, '%'))")
    List<DatCho> findByMaDatChoAndTenHanhKhach(@Param("maDatCho") int maDatCho, @Param("tenHanhKhach") String tenHanhKhach);
    
    // Tìm đặt chỗ theo mã đặt chỗ
    DatCho findByMaDatCho(int maDatCho);
    
    // Tìm tất cả bookings cùng chuyến bay và cùng thời điểm đặt (trong vòng 5 giây)
    @Query("SELECT dc FROM DatCho dc " +
           "WHERE dc.chuyenBay.maChuyenBay = :maChuyenBay " +
           "AND dc.ngayDatCho BETWEEN :startTime AND :endTime")
    List<DatCho> findRelatedBookings(
        @Param("maChuyenBay") int maChuyenBay, 
        @Param("startTime") LocalDateTime startTime, 
        @Param("endTime") LocalDateTime endTime
    );
    
    // Tìm tất cả bookings trong cùng thời điểm đặt (bất kể chuyến bay nào)
    // Dùng cho vé khứ hồi - tìm cả chiều đi và chiều về
    @Query("SELECT dc FROM DatCho dc " +
           "WHERE dc.ngayDatCho BETWEEN :startTime AND :endTime " +
           "ORDER BY dc.chuyenBay.ngayDi, dc.maDatCho")
    List<DatCho> findAllBookingsByTime(
        @Param("startTime") LocalDateTime startTime, 
        @Param("endTime") LocalDateTime endTime
    );

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Tìm tất cả đặt chỗ bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM datcho", nativeQuery = true)
    List<DatCho> findAllIncludingDeleted();

    /**
     * Tìm đặt chỗ đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM datcho WHERE madatcho = :id AND da_xoa = 1", nativeQuery = true)
    Optional<DatCho> findDeletedById(@Param("id") int id);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM datcho WHERE da_xoa = 1", nativeQuery = true)
    List<DatCho> findAllDeleted();

    /**
     * Khôi phục đặt chỗ đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE datcho SET da_xoa = 0, deleted_at = NULL WHERE madatcho = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM datcho WHERE madatcho = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);
}
