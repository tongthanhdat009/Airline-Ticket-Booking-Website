package com.example.j2ee.repository;

import com.example.j2ee.model.DichVuChuyenBay;
import com.example.j2ee.model.DichVuChuyenBayId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DichVuChuyenBayRepository extends JpaRepository<DichVuChuyenBay, DichVuChuyenBayId> {
    boolean existsByDichVuCungCap_MaDichVu(int maDichVu);
    List<DichVuChuyenBay> findByChiTietChuyenBay_MaChuyenBay(int maChuyenBay);
}
