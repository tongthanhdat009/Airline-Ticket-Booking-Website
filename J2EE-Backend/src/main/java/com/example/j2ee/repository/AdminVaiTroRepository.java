package com.example.j2ee.repository;

import com.example.j2ee.model.AdminVaiTro;
import com.example.j2ee.model.AdminVaiTroId;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminVaiTroRepository extends JpaRepository<AdminVaiTro, AdminVaiTroId> {

    List<AdminVaiTro> findByMataikhoan(int mataikhoan);

    List<AdminVaiTro> findByMaVaiTro(int maVaiTro);

    boolean existsById_MataikhoanAndId_MaVaiTro(int mataikhoan, int maVaiTro);

    void deleteById_Mataikhoan(int mataikhoan);

    void deleteById_MaVaiTro(int maVaiTro);

    @Query("SELECT avt.id.maVaiTro FROM AdminVaiTro avt WHERE avt.id.mataikhoan = :mataikhoan")
    List<Integer> findMaVaiTroByMataikhoan(@Param("mataikhoan") int mataikhoan);
}
