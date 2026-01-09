package com.example.j2ee.repository; // Hoặc package repository của bạn

import com.example.j2ee.model.HanhKhach;
import org.springframework.data.jpa.repository.JpaRepository;
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
    // - deleteById(id) -> Xóa

    // Các phương thức truy vấn tùy chỉnh:
    Optional<HanhKhach> findByEmail(String email);
    Optional<HanhKhach> findBySoDienThoai(String soDienThoai);
    Optional<HanhKhach> findByMaDinhDanh(String maDinhDanh);

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
            trangthaithanhtoan ttt ON dc.madatcho = ttt.madatcho
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