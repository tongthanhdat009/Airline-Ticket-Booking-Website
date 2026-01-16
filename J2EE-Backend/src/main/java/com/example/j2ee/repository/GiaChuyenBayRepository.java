package com.example.j2ee.repository;

import com.example.j2ee.model.GiaChuyenBay;
import com.example.j2ee.model.HangVe;
import com.example.j2ee.model.TuyenBay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface GiaChuyenBayRepository extends JpaRepository<GiaChuyenBay, Integer> {
    boolean existsByTuyenBay_MaTuyenBay(int maTuyenBay);
    List<GiaChuyenBay> findByTuyenBay_MaTuyenBay(int maTuyenBay);
    
    @Query("SELECT g FROM GiaChuyenBay g WHERE g.tuyenBay = :tuyenBay " +
            "AND g.hangVe = :hangVe " +
            "AND (" +
            "  (g.ngayApDungDen IS NULL AND (:ngayApDungDen IS NULL OR g.ngayApDungTu <= :ngayApDungDen)) " +
            "  OR " +
            "  (g.ngayApDungDen IS NOT NULL AND :ngayApDungTu <= g.ngayApDungDen " +
            "    AND g.ngayApDungTu <= (:ngayApDungDen)) " +
            "  OR " +
            "  (g.ngayApDungDen IS NOT NULL AND :ngayApDungDen IS NULL AND g.ngayApDungTu <= :ngayApDungTu) " +
            ")")
    List<GiaChuyenBay> findOverlappedByTuyenBayAndHangVe(
            @Param("tuyenBay") TuyenBay tuyenBay,
            @Param("hangVe") HangVe hangVe,
            @Param("ngayApDungTu") LocalDate ngayApDungTu,
            @Param("ngayApDungDen") LocalDate ngayApDungDen
    );

    @Query("SELECT g FROM GiaChuyenBay g WHERE g.tuyenBay = :tuyenBay " +
            "AND g.hangVe = :hangVe " +
            "AND g.maGia <> :maGia " +
            "AND (" +
            "  (g.ngayApDungDen IS NULL AND (:ngayApDungDen IS NULL OR g.ngayApDungTu <= :ngayApDungDen)) " +
            "  OR " +
            "  (g.ngayApDungDen IS NOT NULL AND :ngayApDungTu <= g.ngayApDungDen " +
            "    AND g.ngayApDungTu <= (:ngayApDungDen)) " +
            "  OR " +
            "  (g.ngayApDungDen IS NOT NULL AND :ngayApDungDen IS NULL AND g.ngayApDungTu <= :ngayApDungTu) " +
            ")")
    List<GiaChuyenBay> findOverlappedByTuyenBayAndHangVeExcludingId(
            @Param("tuyenBay") TuyenBay tuyenBay,
            @Param("hangVe") HangVe hangVe,
            @Param("ngayApDungTu") LocalDate ngayApDungTu,
            @Param("ngayApDungDen") LocalDate ngayApDungDen,
            @Param("maGia") int maGia
    );

    /**
     * Tìm giá theo tuyến bay và hạng vé
     */
    GiaChuyenBay findByTuyenBay_MaTuyenBayAndHangVe_MaHangVe(int maTuyenBay, int maHangVe);

    /**
     * Tìm tất cả giá chuyến bay theo hạng vé
     */
    List<GiaChuyenBay> findByHangVe_MaHangVe(int maHangVe);

    @Query(value = """
        SELECT gcb.*
        FROM hangve hv
        JOIN giachuyenbay gcb ON hv.mahangve = gcb.mahangve 
        JOIN tuyenbay tb ON tb.matuyenbay = gcb.matuyenbay
        JOIN chitietchuyenbay ctcb ON ctcb.matuyenbay = tb.matuyenbay
        WHERE ctcb.machuyenbay = :machuyenbay
          AND hv.mahangve = :mahangve
          AND ctcb.ngaydi >= gcb.ngayapdungtu
        ORDER BY gcb.ngayapdungtu DESC
        LIMIT 1
    """, nativeQuery = true)
    GiaChuyenBay findLatestGiaByHangVeAndChuyenBay(
        @Param("machuyenbay") Long machuyenbay,
        @Param("mahangve") Long mahangve
    );

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Tìm tất cả giá chuyến bay bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM giachuyenbay", nativeQuery = true)
    List<GiaChuyenBay> findAllIncludingDeleted();

    /**
     * Tìm giá chuyến bay đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM giachuyenbay WHERE magia = :id AND da_xoa = 1", nativeQuery = true)
    Optional<GiaChuyenBay> findDeletedById(@Param("id") int id);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM giachuyenbay WHERE da_xoa = 1", nativeQuery = true)
    List<GiaChuyenBay> findAllDeleted();

    /**
     * Khôi phục giá chuyến bay đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE giachuyenbay SET da_xoa = 0, deleted_at = NULL WHERE magia = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM giachuyenbay WHERE magia = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);
}
