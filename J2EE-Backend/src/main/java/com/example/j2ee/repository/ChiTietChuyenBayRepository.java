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

    // Spring Data JPA will automatically implement this based on the naming convention
    List<ChiTietChuyenBay> findByDaXoaTrue();

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

    /**
     * Kiểm tra xem máy bay có chuyến bay trong tương lai không
     * Sử dụng cho việc xóa hoặc thay đổi trạng thái máy bay
     */
    @Query("SELECT COUNT(c) > 0 FROM ChiTietChuyenBay c " +
           "WHERE c.mayBay.maMayBay = :maMayBay " +
           "AND c.ngayDi >= :currentDate")
    boolean existsByAircraftInFutureFlights(@Param("maMayBay") int maMayBay,
                                           @Param("currentDate") LocalDate currentDate);

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

    /**
     * Kiểm tra máy bay có trùng lịch bay không (với buffer 30 phút)
     *
     * @param maMayBay Mã máy bay cần kiểm tra
     * @param ngayDi Ngày đi của chuyến bay mới
     * @param gioDi Giờ đi của chuyến bay mới
     * @param ngayDen Ngày đến của chuyến bay mới
     * @param gioDen Giờ đến của chuyến bay mới
     * @param excludeMaChuyenBay Mã chuyến bay loại trừ (khi update chuyến bay)
     * @return số lượng chuyến bay bị trùng lịch (> 0 nghĩa là có trùng)
     */
    @Query(value = "SELECT COUNT(*) FROM chitietchuyenbay c " +
           "WHERE c.mamaybay = :maMayBay " +
           "AND c.da_xoa = 0 " +
           "AND (:excludeMaChuyenBay IS NULL OR c.machuyenbay != :excludeMaChuyenBay) " +
           "AND ( " +
           // Buffer: new arrival must be >= 30min before old departure
           "  ( " +
           "    TIMESTAMP(:ngayDen, :gioDen) > TIMESTAMP(c.ngayden, c.gioden) " +
           "    AND DATE_SUB(TIMESTAMP(:ngayDen, :gioDen), INTERVAL 30 MINUTE) < TIMESTAMP(c.ngaydi, c.giodi) " +
           "  ) " +
           "  OR " +
           // Buffer: new departure must be >= 30min after old arrival
           "  ( " +
           "    TIMESTAMP(:ngayDi, :gioDi) < TIMESTAMP(c.ngaydi, c.giodi) " +
           "    AND DATE_ADD(TIMESTAMP(:ngayDi, :gioDi), INTERVAL 30 MINUTE) > TIMESTAMP(c.ngayden, c.gioden) " +
           "  ) " +
           "  OR " +
           // Overlap: new departure during old flight
           "  ( " +
           "    TIMESTAMP(c.ngaydi, c.giodi) <= TIMESTAMP(:ngayDi, :gioDi) " +
           "    AND TIMESTAMP(c.ngayden, c.gioden) > TIMESTAMP(:ngayDi, :gioDi) " +
           "  ) " +
           "  OR " +
           // Overlap: new arrival during old flight
           "  ( " +
           "    TIMESTAMP(c.ngaydi, c.giodi) < TIMESTAMP(:ngayDen, :gioDen) " +
           "    AND TIMESTAMP(c.ngayden, c.gioden) >= TIMESTAMP(:ngayDen, :gioDen) " +
           "  ) " +
           "  OR " +
           // Overlap: new flight contains old flight
           "  ( " +
           "    TIMESTAMP(:ngayDi, :gioDi) <= TIMESTAMP(c.ngaydi, c.giodi) " +
           "    AND TIMESTAMP(:ngayDen, :gioDen) >= TIMESTAMP(c.ngayden, c.gioden) " +
           "  ) " +
           ")",
           nativeQuery = true)
    long existsAircraftScheduleConflict(
            @Param("maMayBay") int maMayBay,
            @Param("ngayDi") LocalDate ngayDi,
            @Param("gioDi") LocalTime gioDi,
            @Param("ngayDen") LocalDate ngayDen,
            @Param("gioDen") LocalTime gioDen,
            @Param("excludeMaChuyenBay") Integer excludeMaChuyenBay
    );
}
