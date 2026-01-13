package com.example.j2ee.repository;

import com.example.j2ee.model.ChiTietChuyenBay;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChiTietChuyenBayRepository extends JpaRepository<ChiTietChuyenBay, Integer> {
    
    boolean existsByTuyenBay_MaTuyenBay(int maTuyenBay);
    boolean existsBySoHieuChuyenBayAndNgayDiAndGioDiAndNgayDenAndGioDen(
            String soHieuChuyenBay, LocalDate ngayDi, LocalTime gioDi, LocalDate ngayDen, LocalTime gioDen);

    boolean existsBySoHieuChuyenBayAndNgayDiAndGioDiAndNgayDenAndGioDenAndMaChuyenBayNot(
            String soHieuChuyenBay, LocalDate ngayDi, LocalTime gioDi, LocalDate ngayDen, LocalTime gioDen, int maChuyenBay);

    @Query("SELECT COUNT(c) > 0 FROM ChiTietChuyenBay c " +
           "WHERE (c.tuyenBay.sanBayDi.maSanBay = :maSanBay " +
           "OR c.tuyenBay.sanBayDen.maSanBay = :maSanBay) " +
           "AND c.ngayDi >= :currentDate")
    boolean existsByAirportInFutureFlights(@Param("maSanBay") int maSanBay,
                                           @Param("currentDate") LocalDate currentDate);

    @Query("SELECT c FROM ChiTietChuyenBay c " +
           "JOIN c.tuyenBay t " +
           "JOIN t.sanBayDi sdi " +
           "JOIN t.sanBayDen sde " +
           "WHERE sdi.maIATA = :sanBayDi " +
           "AND sde.maIATA = :sanBayDen " +
           "AND c.ngayDi = :ngayDi " +
           "AND c.trangThai = 'Đang mở bán'")
    List<ChiTietChuyenBay> findByRouteAndDate(
            @Param("sanBayDi") String sanBayDi,
            @Param("sanBayDen") String sanBayDen,
            @Param("ngayDi") LocalDate ngayDi);

    /**
     * Lấy danh sách chuyến bay với tính toán số ghế trống
     * Số ghế trống = Tổng ghế của máy bay - COUNT(ghe_da_dat của chuyến đó)
     * Chỉ hiển thị chuyến bay còn ghế trống
     */
    @Query("SELECT c FROM ChiTietChuyenBay c " +
           "JOIN c.tuyenBay t " +
           "JOIN t.sanBayDi sdi " +
           "JOIN t.sanBayDen sde " +
           "JOIN c.mayBay mb " +
           "WHERE sdi.maIATA = :sanBayDi " +
           "AND sde.maIATA = :sanBayDen " +
           "AND c.ngayDi = :ngayDi " +
           "AND c.trangThai = 'Đang mở bán' " +
           "AND (SELECT COUNT(gdd) FROM GheDaDat gdd WHERE gdd.chuyenBay.maChuyenBay = c.maChuyenBay) < mb.tongSoGhe")
    List<ChiTietChuyenBay> findAvailableFlightsWithAvailableSeats(
            @Param("sanBayDi") String sanBayDi,
            @Param("sanBayDen") String sanBayDen,
            @Param("ngayDi") LocalDate ngayDi);

    /**
     * Tính số ghế trống của một chuyến bay
     * Số ghế trống = Tổng ghế của máy bay - COUNT(ghe_da_dat của chuyến đó)
     */
    @Query("SELECT (mb.tongSoGhe - COALESCE(COUNT(gdd), 0)) " +
           "FROM ChiTietChuyenBay c " +
           "JOIN c.mayBay mb " +
           "LEFT JOIN GheDaDat gdd ON gdd.chuyenBay.maChuyenBay = c.maChuyenBay " +
           "WHERE c.maChuyenBay = :maChuyenBay")
    long countAvailableSeats(@Param("maChuyenBay") int maChuyenBay);

    /**
     * Đếm số ghế đã đặt của một chuyến bay
     */
    @Query("SELECT COUNT(gdd) FROM GheDaDat gdd WHERE gdd.chuyenBay.maChuyenBay = :maChuyenBay")
    long countBookedSeats(@Param("maChuyenBay") int maChuyenBay);

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Tìm tất cả chuyến bay bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM chitietchuyenbay", nativeQuery = true)
    List<ChiTietChuyenBay> findAllIncludingDeleted();

    /**
     * Tìm chuyến bay đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM chitietchuyenbay WHERE machuyenbay = :id AND da_xoa = 1", nativeQuery = true)
    Optional<ChiTietChuyenBay> findDeletedById(@Param("id") int id);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM chitietchuyenbay WHERE da_xoa = 1", nativeQuery = true)
    List<ChiTietChuyenBay> findAllDeleted();

    /**
     * Khôi phục chuyến bay đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE chitietchuyenbay SET da_xoa = 0, deleted_at = NULL WHERE machuyenbay = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM chitietchuyenbay WHERE machuyenbay = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);
}
