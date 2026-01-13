package com.example.j2ee.repository;

import com.example.j2ee.model.SanBay;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SanBayRepository extends JpaRepository<SanBay, Integer> {
    SanBay findByMaSanBay(int maSanBay);

    List<SanBay> findByTrangThaiHoatDong(String active);
    Optional<SanBay> findByThanhPhoSanBay(String thanhPhoSanBay);

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Tìm tất cả sân bay bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM sanbay", nativeQuery = true)
    List<SanBay> findAllIncludingDeleted();

    /**
     * Tìm sân bay đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM sanbay WHERE masanbay = :id AND da_xoa = 1", nativeQuery = true)
    Optional<SanBay> findDeletedById(@Param("id") int id);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM sanbay WHERE da_xoa = 1", nativeQuery = true)
    List<SanBay> findAllDeleted();

    /**
     * Khôi phục sân bay đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE sanbay SET da_xoa = 0, deleted_at = NULL WHERE masanbay = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM sanbay WHERE masanbay = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);

}

