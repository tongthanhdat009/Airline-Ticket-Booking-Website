package com.example.j2ee.service;

import com.example.j2ee.model.ChiTietGhe;
import com.example.j2ee.repository.ChiTietChuyenBayRepository;
import com.example.j2ee.repository.ChiTietGheRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChiTietGheService {
    private final ChiTietGheRepository chiTietGheRepository;
    private final ChiTietChuyenBayRepository chiTietChuyenBayRepository;
    public ChiTietGheService(ChiTietGheRepository chiTietGheRepository, ChiTietChuyenBayRepository chiTietChuyenBayRepository) {
        this.chiTietGheRepository = chiTietGheRepository;
        this.chiTietChuyenBayRepository = chiTietChuyenBayRepository;
    }

    public List<ChiTietGhe> getAllChiTietGhe() {
        return chiTietGheRepository.findAll();
    }

    public List<ChiTietGhe> getChiTietGheByGheId(int maChuyenBay) {
        if(!chiTietChuyenBayRepository.existsById(maChuyenBay)) {
            return null;
        }
        return chiTietGheRepository.findByChiTietChuyenBay_MaChuyenBay(maChuyenBay);
    }

    public boolean coGheTrong(Long maChuyenBay, Long maHangVe, Integer soLuongNguoi) {
        Object result = chiTietGheRepository.thongKeGheTheoHangVe(maChuyenBay, maHangVe);
        if (result == null) return false;
        Object[] row = (Object[]) result;
        Long soGheConTrong = ((Number) row[3]).longValue();
        return soGheConTrong >= soLuongNguoi;
    }
}
