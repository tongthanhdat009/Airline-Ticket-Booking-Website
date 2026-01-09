package com.example.j2ee.repository;

import com.example.j2ee.model.TuyenBay;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TuyenBayRepository extends JpaRepository<TuyenBay, Integer> {
    boolean existsBySanBayDi_MaSanBayOrSanBayDen_MaSanBay(int maSanBayDi, int maSanBayDen);

    boolean existsBySanBayDi_MaSanBayAndSanBayDen_MaSanBayAndMaTuyenBayNot(int maSanBayDi,
                                                                           int maSanBayDen,
                                                                           int maTuyenBay);

    // Kiểm tra trùng tuyến bay khi tạo mới (cả sân bay đi và đến giống nhau)
    boolean existsBySanBayDi_MaSanBayAndSanBayDen_MaSanBay(int maSanBayDi, int maSanBayDen);
}
