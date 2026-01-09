package com.example.j2ee.repository;

import com.example.j2ee.model.ChiTietGhe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ChiTietGheRepository extends JpaRepository<ChiTietGhe, Integer> {
    List<ChiTietGhe> findByChiTietChuyenBay_MaChuyenBay(int maChuyenBay);
    
    @Query(value = """
        SELECT 
            g.mahangve AS maHangVe,
            COUNT(g.maghe) AS tongSoGhe,
            COUNT(d.maghe) AS soGheDaDat,
            (COUNT(g.maghe) - COUNT(d.maghe)) AS soGheConTrong
        FROM chitietghe g
        LEFT JOIN datcho d ON g.maghe = d.maghe
        WHERE g.machuyenbay = :maChuyenBay
        AND g.mahangve = :maHangVe
        GROUP BY g.mahangve
        """, nativeQuery = true)
    Object thongKeGheTheoHangVe(Long maChuyenBay, Long maHangVe);
}
