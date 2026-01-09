package com.example.j2ee.repository;

import com.example.j2ee.model.SanBay;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SanBayRepository extends JpaRepository<SanBay, Integer> {
    SanBay findByMaSanBay(int maSanBay);

    List<SanBay> findByTrangThaiHoatDong(String active);
    Optional<SanBay> findByThanhPhoSanBay(String thanhPhoSanBay);

}

