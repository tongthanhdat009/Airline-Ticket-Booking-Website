package com.example.j2ee.repository;

import com.example.j2ee.model.VaiTro;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VaiTroRepository extends JpaRepository<VaiTro, Integer> {
    VaiTro findByMaVaiTro(int maVaiTro);

    Optional<VaiTro> findByTenVaiTro(String tenVaiTro);

    List<VaiTro> findByTrangThai(Boolean trangThai);

    boolean existsByTenVaiTro(String tenVaiTro);
}
