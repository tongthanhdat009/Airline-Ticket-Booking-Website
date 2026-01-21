package com.example.j2ee.service;

import com.example.j2ee.model.ChiTietChuyenBay;
import com.example.j2ee.model.MayBay;
import com.example.j2ee.repository.ChiTietChuyenBayRepository;
import com.example.j2ee.repository.MayBayRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FlightStatusScheduler {

    private static final Logger log = LoggerFactory.getLogger(FlightStatusScheduler.class);

    private final ChiTietChuyenBayRepository chiTietChuyenBayRepository;
    private final MayBayRepository mayBayRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public FlightStatusScheduler(ChiTietChuyenBayRepository chiTietChuyenBayRepository,
            MayBayRepository mayBayRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.chiTietChuyenBayRepository = chiTietChuyenBayRepository;
        this.mayBayRepository = mayBayRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Scheduled(fixedRate = 60000) // Chạy mỗi 60 giây (1 phút)
    @Transactional
    public void updateFlightStatuses() {
        // log.info("========== SCHEDULER RUNNING ==========");
        List<ChiTietChuyenBay> flights = chiTietChuyenBayRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        // log.info("Current time: {}", now);
        // log.info("Total flights to check: {}", flights.size());

        for (ChiTietChuyenBay flight : flights) {
            String oldStatus = flight.getTrangThai();

            // Bỏ qua các chuyến bay đã hủy hoặc đã bay
            if ("Hủy".equals(oldStatus) || "Đã bay".equals(oldStatus)) {
                continue;
            }

            // Tạo thời gian đi và đến dự kiến
            LocalDateTime departureScheduled = flight.getNgayDi().atTime(flight.getGioDi());
            LocalDateTime arrivalScheduled = flight.getNgayDen().atTime(flight.getGioDen());

            // Tính thời gian check-in (30 phút trước giờ bay)
            LocalDateTime checkInTime = departureScheduled.minusMinutes(30);

            // === LUỒNG TRẠNG THÁI CHÍNH ===
            // Đang mở bán -> Đang check-in -> Đang bay -> Đã bay

            // 1. Đang mở bán -> Đang check-in (khi còn <= 30 phút trước giờ bay)
            if ("Đang mở bán".equals(oldStatus) || oldStatus == null || oldStatus.trim().isEmpty()) {

                // Check xem đã đến giờ check-in chưa (30 phút trước khởi hành)
                if (now.isAfter(checkInTime) && now.isBefore(departureScheduled)) {
                    flight.setTrangThai("Đang check-in");
                    chiTietChuyenBayRepository.save(flight);
                    sendFlightUpdate(flight, oldStatus);
                    log.info("Flight {} changed from '{}' to 'Đang check-in'", flight.getSoHieuChuyenBay(), oldStatus);
                }
                // Nếu đã qua giờ khởi hành -> chuyển sang Đang bay
                else if (now.isAfter(departureScheduled) && now.isBefore(arrivalScheduled)) {
                    flight.setTrangThai("Đang bay");
                    flight.setThoiGianDiThucTe(departureScheduled);
                    chiTietChuyenBayRepository.save(flight);
                    sendFlightUpdate(flight, oldStatus);
                    log.info("Flight {} changed from '{}' to 'Đang bay'", flight.getSoHieuChuyenBay(), oldStatus);
                }
                // Nếu đã qua giờ đến -> chuyển thẳng sang Đã bay
                else if (now.isAfter(arrivalScheduled)) {
                    flight.setThoiGianDiThucTe(departureScheduled);
                    flight.setThoiGianDenThucTe(arrivalScheduled);
                    flight.setTrangThai("Đã bay");
                    chiTietChuyenBayRepository.save(flight);
                    updateAircraftLocation(flight);
                    sendFlightUpdate(flight, oldStatus);
                    log.info("Flight {} changed from '{}' to 'Đã bay'", flight.getSoHieuChuyenBay(), oldStatus);
                }
            }

            // 2. Đang check-in -> Đang bay (khi đến giờ khởi hành)
            else if ("Đang check-in".equals(oldStatus)) {
                if (now.isAfter(departureScheduled) && now.isBefore(arrivalScheduled)) {
                    flight.setTrangThai("Đang bay");
                    flight.setThoiGianDiThucTe(departureScheduled);
                    chiTietChuyenBayRepository.save(flight);
                    sendFlightUpdate(flight, oldStatus);
                    log.info("Flight {} changed from 'Đang check-in' to 'Đang bay'", flight.getSoHieuChuyenBay());
                }
                // Nếu đã qua giờ đến -> chuyển thẳng sang Đã bay
                else if (now.isAfter(arrivalScheduled)) {
                    flight.setThoiGianDiThucTe(departureScheduled);
                    flight.setThoiGianDenThucTe(arrivalScheduled);
                    flight.setTrangThai("Đã bay");
                    chiTietChuyenBayRepository.save(flight);
                    updateAircraftLocation(flight);
                    sendFlightUpdate(flight, oldStatus);
                    log.info("Flight {} changed from 'Đang check-in' to 'Đã bay'", flight.getSoHieuChuyenBay());
                }
            }

            // 3. Đang bay -> Đã bay (khi đến giờ hạ cánh)
            else if ("Đang bay".equals(oldStatus)) {
                if (now.isAfter(arrivalScheduled)) {
                    flight.setThoiGianDenThucTe(arrivalScheduled);
                    flight.setTrangThai("Đã bay");
                    chiTietChuyenBayRepository.save(flight);
                    updateAircraftLocation(flight);
                    sendFlightUpdate(flight, oldStatus);
                    log.info("Flight {} changed from 'Đang bay' to 'Đã bay'", flight.getSoHieuChuyenBay());
                }
            }

            // 4. Xử lý chuyến bay "Delay" - Kiểm tra thời gian đến thực tế
            else if ("Delay".equals(oldStatus)) {
                LocalDateTime actualArrival = flight.getThoiGianDenThucTe();
                LocalDateTime actualDeparture = flight.getThoiGianDiThucTe();

                if (actualArrival != null && now.isAfter(actualArrival)) {
                    // Chuyến bay delay đã đến (theo thời gian thực tế)
                    flight.setTrangThai("Đã bay");
                    chiTietChuyenBayRepository.save(flight);
                    updateAircraftLocation(flight);
                    sendFlightUpdate(flight, oldStatus);
                    log.info("Flight {} changed from 'Delay' to 'Đã bay'", flight.getSoHieuChuyenBay());
                } else if (actualDeparture != null && now.isAfter(actualDeparture)
                        && (actualArrival == null || now.isBefore(actualArrival))) {
                    // Delay đã cất cánh nhưng chưa hạ cánh
                    flight.setTrangThai("Đang bay");
                    chiTietChuyenBayRepository.save(flight);
                    sendFlightUpdate(flight, oldStatus);
                    log.info("Flight {} changed from 'Delay' to 'Đang bay'", flight.getSoHieuChuyenBay());
                }
            }

            // 5. Xử lý Đã hạ cánh -> Đã bay (legacy status)
            else if ("Đã hạ cánh".equals(oldStatus)) {
                flight.setTrangThai("Đã bay");
                chiTietChuyenBayRepository.save(flight);
                updateAircraftLocation(flight);
                sendFlightUpdate(flight, oldStatus);
                log.info("Flight {} changed from 'Đã hạ cánh' to 'Đã bay'", flight.getSoHieuChuyenBay());
            }
        }
        // log.info("========== SCHEDULER COMPLETED ==========");
    }

    /**
     * Cập nhật vị trí sân bay hiện tại của máy bay khi chuyến bay hoàn thành
     */
    private void updateAircraftLocation(ChiTietChuyenBay flight) {
        if (flight.getMayBay() != null && flight.getTuyenBay() != null) {
            MayBay mayBay = flight.getMayBay();
            mayBay.setSanBayHienTai(flight.getTuyenBay().getSanBayDen());
            mayBayRepository.save(mayBay);
        }
    }

    private void sendFlightUpdate(ChiTietChuyenBay flight, String oldStatus) {
        // Tạo message chứa thông tin cập nhật đầy đủ
        FlightStatusUpdate update = new FlightStatusUpdate(
                (long) flight.getMaChuyenBay(),
                oldStatus,
                flight.getTrangThai(),
                LocalDateTime.now(),
                flight.getThoiGianDiThucTe(),
                flight.getThoiGianDenThucTe());

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
        public Long getMaChuyenBay() {
            return maChuyenBay;
        }

        public String getOldStatus() {
            return oldStatus;
        }

        public String getNewStatus() {
            return newStatus;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public LocalDateTime getThoiGianDiThucTe() {
            return thoiGianDiThucTe;
        }

        public LocalDateTime getThoiGianDenThucTe() {
            return thoiGianDenThucTe;
        }
    }
}