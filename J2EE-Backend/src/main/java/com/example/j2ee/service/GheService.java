package com.example.j2ee.service;

import com.example.j2ee.model.ChiTietGhe;
import com.example.j2ee.model.HangVe;
import com.example.j2ee.model.MayBay;
import com.example.j2ee.repository.ChiTietGheRepository;
import com.example.j2ee.repository.HangVeRepository;
import com.example.j2ee.repository.MayBayRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class GheService {
    private final ChiTietGheRepository chiTietGheRepository;
    private final MayBayRepository mayBayRepository;
    private final HangVeRepository hangVeRepository;

    public GheService(ChiTietGheRepository chiTietGheRepository,
                     MayBayRepository mayBayRepository,
                     HangVeRepository hangVeRepository) {
        this.chiTietGheRepository = chiTietGheRepository;
        this.mayBayRepository = mayBayRepository;
        this.hangVeRepository = hangVeRepository;
    }

    /**
     * Thêm ghế cho máy bay (sơ đồ ghế)
     * Ghế thuộc về máy bay, không phải chuyến bay
     */
    public String addGheToMayBay(int maMayBay, Map<String, Integer> soGheTheoHangVe) {
        // Kiểm tra máy bay tồn tại
        if (!mayBayRepository.existsById(maMayBay)) {
            return "Máy bay không tồn tại";
        }

        MayBay mayBay = mayBayRepository.findById(maMayBay).get();
        
        try {
            int totalSeats = 0;
            int currentRow = 1;
            
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
                // Mỗi hàng có 6 ghế (A, B, C, D, E, F)
                String[] columns = {"A", "B", "C", "D", "E", "F"};
                int colIndex = 0;
                
                for (int i = 0; i < soGhe; i++) {
                    ChiTietGhe ghe = new ChiTietGhe();
                    ghe.setMayBay(mayBay);
                    ghe.setHangVe(hangVe);
                    ghe.setHang(currentRow);
                    ghe.setCot(columns[colIndex]);
                    ghe.setSoGhe(currentRow + columns[colIndex]);
                    
                    // Xác định vị trí ghế
                    if (columns[colIndex].equals("A") || columns[colIndex].equals("F")) {
                        ghe.setViTriGhe("CỬA SỔ");
                    } else if (columns[colIndex].equals("C") || columns[colIndex].equals("D")) {
                        ghe.setViTriGhe("LỐI ĐI");
                    } else {
                        ghe.setViTriGhe("GIỮA");
                    }
                    
                    chiTietGheRepository.save(ghe);
                    totalSeats++;
                    
                    colIndex++;
                    if (colIndex >= columns.length) {
                        colIndex = 0;
                        currentRow++;
                    }
                }
                
                // Chuyển sang hàng mới cho hạng vé tiếp theo
                if (colIndex > 0) {
                    currentRow++;
                }
            }
            
            return "Thêm " + totalSeats + " ghế cho máy bay thành công";
        } catch (Exception e) {
            return "Lỗi khi thêm ghế: " + e.getMessage();
        }
    }
}
