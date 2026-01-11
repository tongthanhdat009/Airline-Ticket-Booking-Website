package com.example.j2ee.repository;

import com.example.j2ee.model.MayBay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MayBayRepository extends JpaRepository<MayBay, Integer> {
    
    /**
     * Tìm máy bay theo số hiệu
     */
    Optional<MayBay> findBySoHieu(String soHieu);
    
    /**
     * Kiểm tra máy bay tồn tại theo số hiệu
     */
    boolean existsBySoHieu(String soHieu);
}
