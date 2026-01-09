package com.example.j2ee.service;

import com.example.j2ee.model.ChiTietChuyenBay;
import com.example.j2ee.model.ChiTietGhe;
import com.example.j2ee.model.HangVe;
import com.example.j2ee.repository.ChiTietChuyenBayRepository;
import com.example.j2ee.repository.ChiTietGheRepository;
import com.example.j2ee.repository.HangVeRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class GheService {
    private final ChiTietGheRepository chiTietGheRepository;
    private final ChiTietChuyenBayRepository chiTietChuyenBayRepository;
    private final HangVeRepository hangVeRepository;

    public GheService(ChiTietGheRepository chiTietGheRepository,
                     ChiTietChuyenBayRepository chiTietChuyenBayRepository,
                     HangVeRepository hangVeRepository) {
        this.chiTietGheRepository = chiTietGheRepository;
        this.chiTietChuyenBayRepository = chiTietChuyenBayRepository;
        this.hangVeRepository = hangVeRepository;
    }

    // Thêm ghế cho chuyến bay
    public String addGheToChuyenBay(int maChuyenBay, Map<String, Integer> soGheTheoHangVe) {
        // Kiểm tra chuyến bay tồn tại
        if (!chiTietChuyenBayRepository.existsById(maChuyenBay)) {
            return "Chuyến bay không tồn tại";
        }

        ChiTietChuyenBay chuyenBay = chiTietChuyenBayRepository.findById(maChuyenBay).get();
        
        try {
            int totalSeats = 0;
            // Tạo ghế cho từng hạng vé
            for (Map.Entry<String, Integer> entry : soGheTheoHangVe.entrySet()) {
                String hangVeKey = entry.getKey();
                Integer soGhe = entry.getValue();
                
                if (soGhe == null || soGhe <= 0) continue;
                
                // Parse hạng vé ID từ key (soGheEconomy -> 1, soGheDeluxe -> 2, etc.)
                int maHangVe;
                if (hangVeKey.contains("Economy")) {
                    maHangVe = 1;
                } else if (hangVeKey.contains("Deluxe")) {
                    maHangVe = 2;
                } else if (hangVeKey.contains("Business")) {
                    maHangVe = 3;
                } else if (hangVeKey.contains("FirstClass")) {
                    maHangVe = 4;
                } else {
                    continue;
                }
                
                // Kiểm tra hạng vé tồn tại
                if (!hangVeRepository.existsById(maHangVe)) {
                    return "Hạng vé " + maHangVe + " không tồn tại";
                }
                
                HangVe hangVe = hangVeRepository.findById(maHangVe).get();
                
                // Tạo số lượng ghế theo yêu cầu
                for (int i = 0; i < soGhe; i++) {
                    ChiTietGhe ghe = new ChiTietGhe();
                    ghe.setChiTietChuyenBay(chuyenBay);
                    ghe.setHangVe(hangVe);
                    chiTietGheRepository.save(ghe);
                    totalSeats++;
                }
            }
            
            return "Thêm " + totalSeats + " ghế cho chuyến bay thành công";
        } catch (Exception e) {
            return "Lỗi khi thêm ghế: " + e.getMessage();
        }
    }
}
