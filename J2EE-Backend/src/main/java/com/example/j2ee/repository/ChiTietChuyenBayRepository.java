package com.example.j2ee.repository;

import com.example.j2ee.model.ChiTietChuyenBay;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalTime;

public interface ChiTietChuyenBayRepository extends JpaRepository<ChiTietChuyenBay, Integer> {
    
    boolean existsByTuyenBay_MaTuyenBay(int maTuyenBay);
    boolean existsBySoHieuChuyenBayAndNgayDiAndGioDiAndNgayDenAndGioDen(
            String soHieuChuyenBay, LocalDate ngayDi, LocalTime gioDi, LocalDate ngayDen, LocalTime gioDen);

    boolean existsBySoHieuChuyenBayAndNgayDiAndGioDiAndNgayDenAndGioDenAndMaChuyenBayNot(
            String soHieuChuyenBay, LocalDate ngayDi, LocalTime gioDi, LocalDate ngayDen, LocalTime gioDen, int maChuyenBay);

    @Query("SELECT COUNT(c) > 0 FROM ChiTietChuyenBay c " +
           "WHERE (c.tuyenBay.sanBayDi.maSanBay = :maSanBay " +
           "OR c.tuyenBay.sanBayDen.maSanBay = :maSanBay) " +
           "AND c.ngayDi >= :currentDate")
    boolean existsByAirportInFutureFlights(@Param("maSanBay") int maSanBay,
                                           @Param("currentDate") LocalDate currentDate);

    @Query("SELECT c FROM ChiTietChuyenBay c " +
           "JOIN c.tuyenBay t " +
           "JOIN t.sanBayDi sdi " +
           "JOIN t.sanBayDen sde " +
            "WHERE sdi.maIATA = :sanBayDi " +
            "AND sde.maIATA = :sanBayDen " +
            "AND c.ngayDi = :ngayDi " +
            "AND c.trangThai = 'Đang mở bán'")
    List<ChiTietChuyenBay> findByRouteAndDate(
            @Param("sanBayDi") String sanBayDi,
            @Param("sanBayDen") String sanBayDen,
            @Param("ngayDi") LocalDate ngayDi);
}
