package com.example.j2ee.repository;

import com.example.j2ee.model.ChiTietGhe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChiTietGheRepository extends JpaRepository<ChiTietGhe, Integer> {

    /**
     * Tìm tất cả ghế theo máy bay
     */
    List<ChiTietGhe> findByMayBay_MaMayBay(int maMayBay);
    
    /**
     * Tìm ghế theo máy bay và hạng vé
     */
    List<ChiTietGhe> findByMayBay_MaMayBayAndHangVe_MaHangVe(int maMayBay, int maHangVe);
    
    /**
     * Đếm số ghế theo máy bay và hạng vé
     */
    long countByMayBay_MaMayBayAndHangVe_MaHangVe(int maMayBay, int maHangVe);
    
    /**
     * Đếm số ghế của máy bay
     */
    long countByMayBay_MaMayBay(int maMayBay);

    /**
     * Thống kê ghế theo hạng vé cho máy bay
     */
    @Query(value = """
        SELECT mahangve, COUNT(*) as so_luong 
        FROM chitietghe 
        WHERE mamaybay = :maMayBay 
        GROUP BY mahangve
    """, nativeQuery = true)
    List<Object[]> thongKeGheTheoHangVe(@Param("maMayBay") int maMayBay);
}
