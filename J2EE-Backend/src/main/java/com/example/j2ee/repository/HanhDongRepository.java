package com.example.j2ee.repository;

import com.example.j2ee.model.HanhDong;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HanhDongRepository extends JpaRepository<HanhDong, String> {
    HanhDong findByMaHanhDong(String maHanhDong);

    List<HanhDong> findAllByOrderByMaHanhDongAsc();

    boolean existsByMaHanhDong(String maHanhDong);
}
