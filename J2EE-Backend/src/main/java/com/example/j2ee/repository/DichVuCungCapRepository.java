package com.example.j2ee.repository;

import java.util.List;
import com.example.j2ee.model.DichVuCungCap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DichVuCungCapRepository extends JpaRepository<DichVuCungCap, Integer> {
    boolean existsByTenDichVu(String tenDichVu);
    @Query("SELECT dvcb.dichVuCungCap FROM DichVuChuyenBay dvcb WHERE dvcb.chiTietChuyenBay.maChuyenBay = :maChuyenBay")
    List<DichVuCungCap> findDichVuByChuyenBayId(@Param("maChuyenBay") int maChuyenBay);
}
