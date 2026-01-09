package com.example.j2ee.repository;

import com.example.j2ee.model.GiaChuyenBay;
import com.example.j2ee.model.HangVe;
import com.example.j2ee.model.TuyenBay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

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
            @Param("ngayApDungTu") Date ngayApDungTu,
            @Param("ngayApDungDen") Date ngayApDungDen
    );

    /**
     * Tương tự như trên nhưng loại trừ bản ghi có maGia cụ thể (dùng khi sửa)
     */
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
            @Param("ngayApDungTu") Date ngayApDungTu,
            @Param("ngayApDungDen") Date ngayApDungDen,
            @Param("maGia") int maGia
    );

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
}