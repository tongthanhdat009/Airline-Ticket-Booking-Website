package com.example.j2ee.repository;

import com.example.j2ee.model.PhanQuyen;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhanQuyenRepository extends JpaRepository<PhanQuyen, Integer> {

    List<PhanQuyen> findByMaVaiTro(int maVaiTro);

    List<PhanQuyen> findByMaChucNang(int maChucNang);

    List<PhanQuyen> findByMaVaiTroAndMaChucNang(int maVaiTro, int maChucNang);

    boolean existsByMaVaiTroAndMaChucNangAndMaHanhDong(int maVaiTro, int maChucNang, String maHanhDong);

    void deleteByMaVaiTro(int maVaiTro);

    void deleteByMaChucNang(int maChucNang);

    @Query("SELECT DISTINCT pq.maHanhDong FROM PhanQuyen pq WHERE pq.maVaiTro = :maVaiTro")
    List<String> findDistinctHanhDongByVaiTro(@Param("maVaiTro") int maVaiTro);

    @Query("SELECT pq FROM PhanQuyen pq WHERE pq.maVaiTro IN :maVaiTros")
    List<PhanQuyen> findByMaVaiTroIn(@Param("maVaiTros") List<Integer> maVaiTros);
}
