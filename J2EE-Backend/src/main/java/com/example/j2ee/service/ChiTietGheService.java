package com.example.j2ee.service;

import com.example.j2ee.model.ChiTietGhe;
import com.example.j2ee.model.GheDaDat;
import com.example.j2ee.repository.ChiTietChuyenBayRepository;
import com.example.j2ee.repository.ChiTietGheRepository;
import com.example.j2ee.repository.GheDaDatRepository;
import com.example.j2ee.repository.MayBayRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChiTietGheService {
    private final ChiTietGheRepository chiTietGheRepository;
    private final ChiTietChuyenBayRepository chiTietChuyenBayRepository;
    private final GheDaDatRepository gheDaDatRepository;
    private final MayBayRepository mayBayRepository;
    
    public ChiTietGheService(ChiTietGheRepository chiTietGheRepository, 
                             ChiTietChuyenBayRepository chiTietChuyenBayRepository,
                             GheDaDatRepository gheDaDatRepository,
                             MayBayRepository mayBayRepository) {
        this.chiTietGheRepository = chiTietGheRepository;
        this.chiTietChuyenBayRepository = chiTietChuyenBayRepository;
        this.gheDaDatRepository = gheDaDatRepository;
        this.mayBayRepository = mayBayRepository;
    }

    public List<ChiTietGhe> getAllChiTietGhe() {
        return chiTietGheRepository.findAll();
    }

    /**
     * Lấy danh sách ghế của máy bay theo mã máy bay
     */
    public List<ChiTietGhe> getChiTietGheByMayBay(int maMayBay) {
        if(!mayBayRepository.existsById(maMayBay)) {
            return null;
        }
        return chiTietGheRepository.findByMayBay_MaMayBay(maMayBay);
    }
    
    /**
     * Lấy danh sách ghế khả dụng cho một chuyến bay
     * Dựa vào máy bay của chuyến bay và loại trừ ghế đã đặt
     */
    public List<ChiTietGhe> getAvailableSeatsForFlight(int maChuyenBay) {
        var chuyenBay = chiTietChuyenBayRepository.findById(maChuyenBay).orElse(null);
        if (chuyenBay == null || chuyenBay.getMayBay() == null) {
            return null;
        }
        
        int maMayBay = chuyenBay.getMayBay().getMaMayBay();
        List<ChiTietGhe> allSeats = chiTietGheRepository.findByMayBay_MaMayBay(maMayBay);
        
        // Lấy danh sách ghế đã đặt cho chuyến bay này
        List<GheDaDat> bookedSeats = gheDaDatRepository.findByChuyenBay_MaChuyenBay(maChuyenBay);
        List<Integer> bookedSeatIds = bookedSeats.stream()
                .map(gdd -> gdd.getGhe().getMaGhe())
                .collect(Collectors.toList());
        
        // Trả về ghế chưa được đặt
        return allSeats.stream()
                .filter(seat -> !bookedSeatIds.contains(seat.getMaGhe()))
                .collect(Collectors.toList());
    }

    /**
     * Kiểm tra còn ghế trống cho hạng vé của chuyến bay
     * Dựa vào soluong_phanbo và soluong_daban trong giachuyenbay
     */
    public boolean coGheTrong(Long maChuyenBay, Long maHangVe, Integer soLuongNguoi) {
        var chuyenBay = chiTietChuyenBayRepository.findById(maChuyenBay.intValue()).orElse(null);
        if (chuyenBay == null || chuyenBay.getMayBay() == null) {
            return false;
        }
        
        int maMayBay = chuyenBay.getMayBay().getMaMayBay();
        
        // Đếm tổng số ghế của hạng vé trên máy bay
        long tongGhe = chiTietGheRepository.countByMayBay_MaMayBayAndHangVe_MaHangVe(maMayBay, maHangVe.intValue());
        
        // Đếm số ghế đã đặt cho hạng vé trên chuyến bay này
        long gheDaDat = gheDaDatRepository.countByChuyenBay_MaChuyenBayAndGhe_HangVe_MaHangVe(
                maChuyenBay.intValue(), maHangVe.intValue());
        
        long soGheConTrong = tongGhe - gheDaDat;
        return soGheConTrong >= soLuongNguoi;
    }
}
