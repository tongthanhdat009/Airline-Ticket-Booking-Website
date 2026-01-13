package com.example.j2ee.repository;

import com.example.j2ee.model.HangVe;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HangVeRepository extends JpaRepository<HangVe, Integer> {
    boolean existsByTenHangVe(String tenHangVe);
}
