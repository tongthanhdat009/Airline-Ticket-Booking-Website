package com.example.j2ee.repository;

import java.util.List;
import java.util.Optional;

import com.example.j2ee.model.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BannerRepository extends JpaRepository<Banner, Integer> {

    // ==================== BUSINESS QUERY METHODS ====================
    /**
     * Kiểm tra xem banner có tồn tại theo tiêu đề không
     */
    boolean existsByTieuDe(String tieuDe);

    /**
     * Tìm banner theo vị trí hiển thị
     */
    List<Banner> findByViTri(String viTri);

    /**
     * Tìm banner theo trạng thái kích hoạt
     */
    List<Banner> findByTrangThai(Boolean trangThai);

    /**
     * Tìm banner theo vị trí và trạng thái
     */
    List<Banner> findByViTriAndTrangThai(String viTri, Boolean trangThai);

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Tìm tất cả banner bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM banners", nativeQuery = true)
    List<Banner> findAllIncludingDeleted();

    /**
     * Tìm banner đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM banners WHERE mabanner = :id AND da_xoa = 1", nativeQuery = true)
    Optional<Banner> findDeletedById(@Param("id") int id);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM banners WHERE da_xoa = 1", nativeQuery = true)
    List<Banner> findAllDeleted();

    /**
     * Khôi phục banner đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE banners SET da_xoa = 0, deleted_at = NULL WHERE mabanner = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM banners WHERE mabanner = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);
}
