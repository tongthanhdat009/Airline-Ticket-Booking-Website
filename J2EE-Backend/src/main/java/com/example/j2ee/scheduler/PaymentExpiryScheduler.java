package com.example.j2ee.scheduler;

import com.example.j2ee.model.ChiTietGhe;
import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.DonHang;
import com.example.j2ee.model.GheDaDat;
import com.example.j2ee.model.TrangThaiThanhToan;
import com.example.j2ee.repository.DatChoRepository;
import com.example.j2ee.repository.DonHangRepository;
import com.example.j2ee.repository.GheDaDatRepository;
import com.example.j2ee.repository.TrangThaiThanhToanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentExpiryScheduler {

    private final TrangThaiThanhToanRepository trangThaiThanhToanRepository;
    private final DonHangRepository donHangRepository;
    private final DatChoRepository datChoRepository;
    private final GheDaDatRepository gheDaDatRepository;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cancelExpiredPayments() {
        try {
            LocalDateTime now = LocalDateTime.now();

            List<TrangThaiThanhToan> expiredPayments = trangThaiThanhToanRepository
                    .findAll().stream()
                    .filter(tt -> tt.getDaThanhToan() == 'N'
                            && tt.getNgayHetHan() != null
                            && convertToLocalDate(tt.getNgayHetHan()).isBefore(now.toLocalDate()))
                    .toList();

            if (expiredPayments.isEmpty()) {
                return;
            }

            log.info("Found {} expired payments to cancel", expiredPayments.size());

            for (TrangThaiThanhToan thanhToan : expiredPayments) {
                try {
                    cancelExpiredPayment(thanhToan);
                } catch (Exception e) {
                    log.error("Failed to cancel expired payment: {}", thanhToan.getMaThanhToan(), e);
                }
            }

            log.info("Successfully cancelled {} expired payments", expiredPayments.size());
        } catch (Exception e) {
            log.error("Error in PaymentExpiryScheduler", e);
        }
    }

    private void cancelExpiredPayment(TrangThaiThanhToan thanhToan) {
        thanhToan.setDaThanhToan('H');
        thanhToan.setTrangThai("CANCELLED");
        trangThaiThanhToanRepository.save(thanhToan);

        DonHang donHang = thanhToan.getDonHang();
        if (donHang != null) {
            donHang.setTrangThai("DA HUY");
            donHangRepository.save(donHang);

            List<DatCho> danhSachDatCho = datChoRepository.findByDonHang_MaDonHang(donHang.getMaDonHang());
            for (DatCho datCho : danhSachDatCho) {
                datCho.setTrangThai("CANCELLED");
                datChoRepository.save(datCho);

                ChiTietGhe ghe = datCho.getChiTietGhe();
                if (ghe != null) {
                    List<GheDaDat> gheDaDatList = gheDaDatRepository
                            .findByDatCho_MaDatCho(datCho.getMaDatCho());
                    for (GheDaDat gheDaDat : gheDaDatList) {
                        gheDaDatRepository.delete(gheDaDat);
                    }
                }
            }

            log.info("Cancelled expired order: PNR={}, maThanhToan={}",
                    donHang.getPnr(), thanhToan.getMaThanhToan());
        }
    }

    private java.time.LocalDate convertToLocalDate(Date date) {
        // Handle java.sql.Date which doesn't support toInstant()
        return new java.sql.Date(date.getTime()).toLocalDate();
    }
}
