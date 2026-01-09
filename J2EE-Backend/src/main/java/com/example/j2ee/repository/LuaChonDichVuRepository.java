package com.example.j2ee.repository;

import com.example.j2ee.model.LuaChonDichVu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LuaChonDichVuRepository extends JpaRepository<LuaChonDichVu, Integer> {
    List<LuaChonDichVu> findByDichVuCungCap_MaDichVu(int maDichVu);
}
