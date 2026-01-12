package com.example.j2ee.repository;

import com.example.j2ee.model.ChucNang;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChucNangRepository extends JpaRepository<ChucNang, Integer> {
    ChucNang findByMaChucNang(int maChucNang);

    Optional<ChucNang> findByMaCode(String maCode);

    List<ChucNang> findByNhom(String nhom);

    List<ChucNang> findByNhomOrderByTenChucNangAsc(String nhom);

    boolean existsByMaCode(String maCode);
}
