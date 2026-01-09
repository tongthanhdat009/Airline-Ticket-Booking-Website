package com.example.j2ee.repository;

import com.example.j2ee.model.DatCho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface DatChoRepository extends JpaRepository<DatCho, Integer> {
    
    // Tìm đặt chỗ theo hành khách
    List<DatCho> findByHanhKhach_MaHanhKhach(int maHanhKhach);
    
    // Tìm đặt chỗ theo ghế
    DatCho findByChiTietGhe_MaGhe(int maGhe);
    
    // Tìm đặt chỗ theo mã đặt chỗ và tên hành khách
    @Query("SELECT dc FROM DatCho dc WHERE dc.maDatCho = :maDatCho AND LOWER(dc.hanhKhach.hoVaTen) LIKE LOWER(CONCAT('%', :tenHanhKhach, '%'))")
    List<DatCho> findByMaDatChoAndTenHanhKhach(@Param("maDatCho") int maDatCho, @Param("tenHanhKhach") String tenHanhKhach);
    
    // Tìm đặt chỗ theo mã đặt chỗ
    DatCho findByMaDatCho(int maDatCho);
    
    // Tìm tất cả bookings cùng chuyến bay và cùng thời điểm đặt (trong vòng 5 giây)
    @Query("SELECT dc FROM DatCho dc " +
           "WHERE dc.chiTietGhe.chiTietChuyenBay.maChuyenBay = :maChuyenBay " +
           "AND dc.ngayDatCho BETWEEN :startTime AND :endTime")
    List<DatCho> findRelatedBookings(
        @Param("maChuyenBay") int maChuyenBay, 
        @Param("startTime") Date startTime, 
        @Param("endTime") Date endTime
    );
    
    // Tìm tất cả bookings trong cùng thời điểm đặt (bất kể chuyến bay nào)
    // Dùng cho vé khứ hồi - tìm cả chiều đi và chiều về
    @Query("SELECT dc FROM DatCho dc " +
           "WHERE dc.ngayDatCho BETWEEN :startTime AND :endTime " +
           "ORDER BY dc.chiTietGhe.chiTietChuyenBay.ngayDi, dc.maDatCho")
    List<DatCho> findAllBookingsByTime(
        @Param("startTime") Date startTime, 
        @Param("endTime") Date endTime
    );
}
