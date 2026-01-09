package com.example.j2ee.repository;

import com.example.j2ee.model.DatChoDichVu;
import com.example.j2ee.model.DatChoDichVuId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DatChoDichVuRepository extends JpaRepository<DatChoDichVu, DatChoDichVuId> {
    boolean existsByLuaChonDichVu_MaLuaChon(int maLuaChon);
    
    // Lấy danh sách dịch vụ đã đặt theo mã đặt chỗ
    @Query("SELECT dcdv FROM DatChoDichVu dcdv " +
           "LEFT JOIN FETCH dcdv.luaChonDichVu lcv " +
           "LEFT JOIN FETCH lcv.dichVuCungCap dvc " +
           "WHERE dcdv.datCho.maDatCho = :maDatCho")
    List<DatChoDichVu> findByDatCho_MaDatCho(@Param("maDatCho") int maDatCho);
}