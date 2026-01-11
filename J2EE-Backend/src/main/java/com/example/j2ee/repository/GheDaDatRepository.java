package com.example.j2ee.repository;

import com.example.j2ee.model.GheDaDat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface GheDaDatRepository extends JpaRepository<GheDaDat, Integer> {

    /**
     * Kiểm tra xem một ghế đã được đặt cho chuyến bay chưa
     * Đây là chốt chặn cuối cùng để chống race condition
     */
    boolean existsByChuyenBay_MaChuyenBayAndGhe_MaGhe(int maChuyenBay, int maGhe);

    /**
     * Lấy tất cả các ghế đã đặt của một chuyến bay
     */
    List<GheDaDat> findByChuyenBay_MaChuyenBay(int maChuyenBay);

    /**
     * Đếm số ghế đã đặt của một chuyến bay
     */
    long countByChuyenBay_MaChuyenBay(int maChuyenBay);

    /**
     * Lấy thông tin ghế đã đặt theo mã đặt chỗ
     */
    List<GheDaDat> findByDatCho_MaDatCho(int maDatCho);

    /**
     * Đếm số ghế đã đặt theo chuyến bay và hạng vé
     */
    long countByChuyenBay_MaChuyenBayAndGhe_HangVe_MaHangVe(int maChuyenBay, int maHangVe);

    /**
     * Kiểm tra xem ghế đã được đặt bởi người khác chưa (trừ ra các đặt chỗ bị hủy)
     */
    @Query("SELECT CASE WHEN COUNT(gdd) > 0 THEN true ELSE false END " +
           "FROM GheDaDat gdd " +
           "JOIN gdd.datCho dc " +
           "WHERE gdd.chuyenBay.maChuyenBay = :maChuyenBay " +
           "AND gdd.ghe.maGhe = :maGhe " +
           "AND (dc.trangThai IS NULL OR dc.trangThai != 'CANCELLED')")
    boolean existsByChuyenBayAndGheAndActive(@Param("maChuyenBay") int maChuyenBay, 
                                              @Param("maGhe") int maGhe);

    /**
     * Xóa ghế đã đặt theo chuyến bay và mã ghế
     * Dùng khi hoàn tiền để giải phóng ghế
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM GheDaDat gdd WHERE gdd.chuyenBay.maChuyenBay = :maChuyenBay AND gdd.ghe.maGhe = :maGhe")
    void deleteByChuyenBay_MaChuyenBayAndGhe_MaGhe(@Param("maChuyenBay") int maChuyenBay, 
                                                    @Param("maGhe") int maGhe);
}
