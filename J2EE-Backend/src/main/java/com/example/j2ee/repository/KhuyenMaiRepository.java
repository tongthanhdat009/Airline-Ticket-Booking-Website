package com.example.j2ee.repository;

import com.example.j2ee.model.KhuyenMai;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * Repository cho KhuyenMai với support cho Lock để chống Race Condition
 */
public interface KhuyenMaiRepository extends JpaRepository<KhuyenMai, Integer> {
    
    /**
     * Tìm mã khuyến mãi bằng mã (khóa unique)
     */
    Optional<KhuyenMai> findByMaKM(String maKM);
    
    /**
     * Tìm mã khuyến mãi và lock row để chống Race Condition
     * Khi 100 người bấm "Áp dụng" cùng lúc, chỉ 1 người có thể lock row
     * Người tiếp theo sẽ phải chờ cho đến khi transaction hoàn thành
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT k FROM KhuyenMai k WHERE k.maKM = :maKM")
    Optional<KhuyenMai> findByMaKMWithLock(@Param("maKM") String maKM);
    
    /**
     * Kiểm tra mã khuyến mãi còn hiệu lực không
     */
    @Query("SELECT CASE WHEN k.trangThai = 'ACTIVE' AND CURRENT_TIMESTAMP BETWEEN k.ngayBatDau AND k.ngayKetThuc THEN true ELSE false END FROM KhuyenMai k WHERE k.maKM = :maKM")
    Boolean isActive(@Param("maKM") String maKM);
    
    /**
     * Kiểm tra mã khuyến mãi còn lượt dùng không
     */
    @Query("SELECT CASE WHEN k.soLuong IS NULL OR k.soLuongDaDuocDung < k.soLuong THEN true ELSE false END FROM KhuyenMai k WHERE k.maKM = :maKM")
    Boolean hasQuota(@Param("maKM") String maKM);
}
