package com.example.j2ee.service;

import com.example.j2ee.model.ChiTietChuyenBay;
import com.example.j2ee.repository.ChiTietChuyenBayRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FlightStatusScheduler {

    private static final Logger log = LoggerFactory.getLogger(FlightStatusScheduler.class);
    
    private final ChiTietChuyenBayRepository chiTietChuyenBayRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public FlightStatusScheduler(ChiTietChuyenBayRepository chiTietChuyenBayRepository, SimpMessagingTemplate messagingTemplate) {
        this.chiTietChuyenBayRepository = chiTietChuyenBayRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Scheduled(fixedRate = 60000) // Chạy mỗi 60 giây (1 phút)
    public void updateFlightStatuses() {
        // log.info("========== SCHEDULER RUNNING ==========");
        List<ChiTietChuyenBay> flights = chiTietChuyenBayRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        // log.info("Current time: {}", now);
        // log.info("Total flights to check: {}", flights.size());

        for (ChiTietChuyenBay flight : flights) {
            String oldStatus = flight.getTrangThai();

            // Tạo thời gian đi và đến dự kiến
            LocalDateTime departureScheduled = flight.getNgayDi().atTime(flight.getGioDi());
            LocalDateTime arrivalScheduled = flight.getNgayDen().atTime(flight.getGioDen());
            
            // log.info("Flight {}: Status='{}', DepartureScheduled={}, ArrivalScheduled={}, CurrentTime={}", 
            //     flight.getSoHieuChuyenBay(), 
            //     oldStatus,
            //     departureScheduled,
            //     arrivalScheduled, 
            //     now);

            // === XỬ LÝ CÁC TRẠNG THÁI ===
            
            // 1. Xử lý chuyến bay "Đang mở bán" hoặc null
            boolean canUpdateToCompleted = "Đang mở bán".equals(oldStatus) || oldStatus == null || oldStatus.trim().isEmpty();
            
            if (canUpdateToCompleted && arrivalScheduled.isBefore(now)) {
                // log.info(">>> UPDATING Flight {} from '{}' to 'Đã bay' (on-time)", flight.getSoHieuChuyenBay(), oldStatus);
                
                // Cập nhật thời gian thực tế = thời gian dự kiến (chuyến bay đúng giờ)
                flight.setThoiGianDiThucTe(departureScheduled);
                flight.setThoiGianDenThucTe(arrivalScheduled);
                flight.setTrangThai("Đã bay");
                
                chiTietChuyenBayRepository.save(flight);
                sendFlightUpdate(flight, oldStatus);
            }
            
            // 2. Xử lý chuyến bay "Delay" - Kiểm tra thời gian đến thực tế
            else if ("Delay".equals(oldStatus)) {
                LocalDateTime actualArrival = flight.getThoiGianDenThucTe();
                
                if (actualArrival != null && actualArrival.isBefore(now)) {
                    // Chuyến bay delay đã đến (theo thời gian thực tế)
                    // log.info(">>> UPDATING Flight {} from 'Delay' to 'Đã bay' (delayed arrival completed)", flight.getSoHieuChuyenBay());
                    flight.setTrangThai("Đã bay");
                    chiTietChuyenBayRepository.save(flight);
                    sendFlightUpdate(flight, oldStatus);
                } else if (actualArrival == null && arrivalScheduled.isBefore(now)) {
                    // Chuyến delay chưa set thời gian thực tế nhưng đã quá giờ dự kiến
                    log.warn("Flight {} is Delay but no actual arrival time set, and scheduled time has passed", flight.getSoHieuChuyenBay());
                }
            }
            
            // 3. Phát hiện delay mới - Chuyến bay có thời gian thực tế trễ hơn dự kiến
            else if ("Đang mở bán".equals(oldStatus) && flight.getThoiGianDenThucTe() != null) {
                long thresholdMinutes = 30; // 30 phút
                
                if (flight.getThoiGianDenThucTe().isAfter(arrivalScheduled.plusMinutes(thresholdMinutes))) {
                    // log.info(">>> UPDATING Flight {} from 'Đang mở bán' to 'Delay' (detected delay)", flight.getSoHieuChuyenBay());
                    flight.setTrangThai("Delay");
                    chiTietChuyenBayRepository.save(flight);
                    sendFlightUpdate(flight, oldStatus);
                }
            }
        }
        // log.info("========== SCHEDULER COMPLETED ==========");
    }

    private void sendFlightUpdate(ChiTietChuyenBay flight, String oldStatus) {
        // Tạo message chứa thông tin cập nhật đầy đủ
        FlightStatusUpdate update = new FlightStatusUpdate(
            (long) flight.getMaChuyenBay(),
            oldStatus,
            flight.getTrangThai(),
            LocalDateTime.now(),
            flight.getThoiGianDiThucTe(),
            flight.getThoiGianDenThucTe()
        );

        // log.info("Sending WebSocket update for flight {}: {} -> {}", 
            // flight.getSoHieuChuyenBay(), oldStatus, flight.getTrangThai());
        
        // Gửi message tới tất cả client đang subscribe /topic/flight-updates
        messagingTemplate.convertAndSend("/topic/flight-updates", update);
    }

    // Inner class để chứa thông tin cập nhật
    public static class FlightStatusUpdate {
        private Long maChuyenBay;
        private String oldStatus;
        private String newStatus;
        private LocalDateTime timestamp;
        private LocalDateTime thoiGianDiThucTe;
        private LocalDateTime thoiGianDenThucTe;

        public FlightStatusUpdate(Long maChuyenBay, String oldStatus, String newStatus, LocalDateTime timestamp,
                                LocalDateTime thoiGianDiThucTe, LocalDateTime thoiGianDenThucTe) {
            this.maChuyenBay = maChuyenBay;
            this.oldStatus = oldStatus;
            this.newStatus = newStatus;
            this.timestamp = timestamp;
            this.thoiGianDiThucTe = thoiGianDiThucTe;
            this.thoiGianDenThucTe = thoiGianDenThucTe;
        }

        // Getters
        public Long getMaChuyenBay() { return maChuyenBay; }
        public String getOldStatus() { return oldStatus; }
        public String getNewStatus() { return newStatus; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public LocalDateTime getThoiGianDiThucTe() { return thoiGianDiThucTe; }
        public LocalDateTime getThoiGianDenThucTe() { return thoiGianDenThucTe; }
    }
}