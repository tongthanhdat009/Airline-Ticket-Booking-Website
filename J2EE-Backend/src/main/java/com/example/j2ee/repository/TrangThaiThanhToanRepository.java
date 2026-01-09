package com.example.j2ee.repository;

import com.example.j2ee.model.TrangThaiThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrangThaiThanhToanRepository extends JpaRepository<TrangThaiThanhToan, Integer> {
    
    // Tìm thanh toán theo trạng thái (Y = đã thanh toán, N = đang xử lý)
    List<TrangThaiThanhToan> findByDaThanhToan(char daThanhToan);
    
    // Tìm thanh toán theo mã đặt chỗ
    TrangThaiThanhToan findByDatCho_MaDatCho(int maDatCho);
}
