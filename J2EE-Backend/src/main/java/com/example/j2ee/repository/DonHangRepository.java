package com.example.j2ee.repository;

import com.example.j2ee.model.DonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonHangRepository extends JpaRepository<DonHang, Integer> {

    /**
     * Tìm đơn hàng theo mã PNR
     */
    Optional<DonHang> findByPnr(String pnr);

    /**
     * Tìm đơn hàng theo mã PNR (không phân biệt hoa thường)
     */
    Optional<DonHang> findByPnrIgnoreCase(String pnr);

    /**
     * Kiểm tra xem PNR đã tồn tại chưa
     */
    boolean existsByPnr(String pnr);

    /**
     * Tìm đơn hàng theo email người đặt
     */
    List<DonHang> findByEmailNguoiDat(String email);

    /**
     * Tìm đơn hàng theo email người đặt và trạng thái
     */
    List<DonHang> findByEmailNguoiDatAndTrangThai(String email, String trangThai);

    /**
     * Tìm đơn hàng theo số điện thoại người đặt
     */
    List<DonHang> findBySoDienThoaiNguoiDat(String soDienThoai);

    /**
     * Tìm đơn hàng theo hành khách người đặt
     */
    List<DonHang> findByHanhKhachNguoiDat_MaHanhKhach(int maHanhKhach);
}
