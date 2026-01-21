package com.example.j2ee.repository;

import com.example.j2ee.model.TuyenBay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TuyenBayRepository extends JpaRepository<TuyenBay, Integer> {
    boolean existsBySanBayDi_MaSanBayOrSanBayDen_MaSanBay(int maSanBayDi, int maSanBayDen);

    boolean existsBySanBayDi_MaSanBayAndSanBayDen_MaSanBayAndMaTuyenBayNot(int maSanBayDi,
            int maSanBayDen,
            int maTuyenBay);

    // Kiểm tra trùng tuyến bay khi tạo mới (cả sân bay đi và đến giống nhau)
    boolean existsBySanBayDi_MaSanBayAndSanBayDen_MaSanBay(int maSanBayDi, int maSanBayDen);

    /**
     * Tìm các tuyến bay khởi hành từ sân bay có mã maSanBay
     * Dùng để lọc tuyến bay phù hợp với vị trí hiện tại của máy bay
     */
    List<TuyenBay> findBySanBayDi_MaSanBay(int maSanBay);

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Tìm tất cả tuyến bay bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM tuyenbay", nativeQuery = true)
    List<TuyenBay> findAllIncludingDeleted();

    /**
     * Tìm tuyến bay đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM tuyenbay WHERE matuyenbay = :id AND da_xoa = 1", nativeQuery = true)
    Optional<TuyenBay> findDeletedById(@Param("id") int id);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM tuyenbay WHERE da_xoa = 1", nativeQuery = true)
    List<TuyenBay> findAllDeleted();

    /**
     * Khôi phục tuyến bay đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE tuyenbay SET da_xoa = 0, deleted_at = NULL WHERE matuyenbay = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM tuyenbay WHERE matuyenbay = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);
}
