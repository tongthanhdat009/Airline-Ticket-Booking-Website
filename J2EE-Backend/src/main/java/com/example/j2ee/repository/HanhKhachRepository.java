package com.example.j2ee.repository; // Hoặc package repository của bạn

import com.example.j2ee.model.HanhKhach;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HanhKhachRepository extends JpaRepository<HanhKhach, Integer> {
    // Spring Data JPA tự động tạo các phương thức:
    // - findAll() -> Lấy tất cả
    // - findById(id) -> Lấy theo ID
    // - save(hanhKhach) -> Lưu/Cập nhật
    // - deleteById(id) -> Xóa (soft delete do @SQLDelete)

    // Các phương thức truy vấn tùy chỉnh:
    Optional<HanhKhach> findByEmail(String email);
    Optional<HanhKhach> findBySoDienThoai(String soDienThoai);
    Optional<HanhKhach> findByMaDinhDanh(String maDinhDanh);

    // ==================== SOFT DELETE METHODS ====================
    /**
     * Tìm tất cả hành khách bao gồm cả đã xóa mềm
     */
    @Query(value = "SELECT * FROM hanhkhach", nativeQuery = true)
    List<HanhKhach> findAllIncludingDeleted();

    /**
     * Tìm hành khách đã xóa mềm theo ID
     */
    @Query(value = "SELECT * FROM hanhkhach WHERE mahanhkhach = :id AND da_xoa = 1", nativeQuery = true)
    Optional<HanhKhach> findDeletedById(@Param("id") int id);

    /**
     * Lấy tất cả bản ghi đã bị xóa mềm
     */
    @Query(value = "SELECT * FROM hanhkhach WHERE da_xoa = 1", nativeQuery = true)
    List<HanhKhach> findAllDeleted();

    /**
     * Khôi phục hành khách đã xóa mềm
     */
    @Modifying
    @Query(value = "UPDATE hanhkhach SET da_xoa = 0, deleted_at = NULL WHERE mahanhkhach = :id", nativeQuery = true)
    void restoreById(@Param("id") int id);

    /**
     * Xóa cứng (vĩnh viễn) - chỉ dùng khi cần thiết
     */
    @Modifying
    @Query(value = "DELETE FROM hanhkhach WHERE mahanhkhach = :id", nativeQuery = true)
    void hardDeleteById(@Param("id") int id);

    @Query(value = """
        SELECT
            dc.madatcho AS maDatCho,
            ctcb.sohieuchuyenbay AS soHieuChuyenBay,
            sb_di.thanhphosanbay AS diemDi,
            sb_den.thanhphosanbay AS diemDen,
            ctcb.ngaydi AS ngayDi,
            ttt.sotien AS tongTien
        FROM
            datcho dc
        JOIN
            hanhkhach hk ON dc.mahanhkhach = hk.mahanhkhach
        JOIN
            chitietghe ctg ON dc.maghe = ctg.maghe
        JOIN
            chitietchuyenbay ctcb ON ctg.machuyenbay = ctcb.machuyenbay
        JOIN
            tuyenbay tb ON ctcb.matuyenbay = tb.matuyenbay
        JOIN
            sanbay sb_di ON tb.masanbaydi = sb_di.masanbay
        JOIN
            sanbay sb_den ON tb.masanbayden = sb_den.masanbay
        JOIN
            donhang dh ON dc.madonhang = dh.madonhang
        JOIN
            trangthaithanhtoan ttt ON dh.madonhang = ttt.madonhang
        WHERE
            hk.mahanhkhach = :maHanhKhach
        ORDER BY
            dc.madatcho
        """, nativeQuery = true)
    List<Object[]> findChuyenBayByKhachHang(@Param("maHanhKhach") Integer maHanhKhach);

    @Query(value = """
        SELECT
            ldv.tenluachon AS tenLuaChon,
            dcdv.soluong AS soLuong,
            dcdv.dongia AS donGia
        FROM
            datchodichvu dcdv
        JOIN
            luachondichvu ldv ON dcdv.maluachon = ldv.maluachon
        WHERE
            dcdv.madatcho = :maDatCho
        ORDER BY
            ldv.tenluachon
        """, nativeQuery = true)
    List<Object[]> findDichVuByDatCho(@Param("maDatCho") Integer maDatCho);
}