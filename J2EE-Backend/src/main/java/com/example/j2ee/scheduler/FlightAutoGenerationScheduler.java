package com.example.j2ee.scheduler;

import com.example.j2ee.model.ChiTietChuyenBay;
import com.example.j2ee.repository.ChiTietChuyenBayRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Job tự động sinh dữ liệu chuyến bay tương lai.
 * <p>
 * Trang tìm chuyến bay (/chon-chuyen-bay) lọc theo ngày đi + trạng thái
 * 'Đang mở bán', nên DB phải luôn có chuyến bay cho các ngày sắp tới.
 * Job này đảm bảo mọi ngày từ hôm nay đến +30 ngày đều có lịch bay bằng cách
 * clone lịch bay theo chu kỳ 7 ngày (giữ pattern theo thứ trong tuần).
 * Chạy mỗi ngày lúc 2h sáng và 1 lần khi app khởi động để backfill ngay.
 * <p>
 * Fix P0-4: tách backfill startup (@Async, không chặn ready) khỏi lịch daily;
 * không giữ 1 transaction bao cả vòng lặp (mỗi save() là 1 transaction riêng
 * của repository); timezone cố định Asia/Ho_Chi_Minh; clone kèm dịch vụ;
 * batch 2 query cho cả cửa sổ ngày thay vì N+1.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FlightAutoGenerationScheduler {

    private static final int LOOKAHEAD_DAYS = 30;
    private static final String TRANG_THAI_MO_BAN = "Đang mở bán";
    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final ChiTietChuyenBayRepository chiTietChuyenBayRepository;

    /** Backfill khi app ready, chạy nền để không chặn startup. */
    @EventListener(ApplicationReadyEvent.class)
    @Async
    public void backfillOnStartup() {
        generateRange(today());
    }

    /** Lịch daily 2h sáng giờ VN. */
    @Scheduled(cron = "0 0 2 * * ?", zone = "Asia/Ho_Chi_Minh")
    public void generateDaily() {
        generateRange(today());
    }

    LocalDate today() {
        return LocalDate.now(ZONE);
    }

    /**
     * Sinh lịch cho [today, today + LOOKAHEAD_DAYS].
     * Batch: 1 query lấy toàn bộ chuyến trong cửa sổ + template tuần trước,
     * 1 query ngày xa nhất (chỉ khi cần fallback cold-start).
     * Không @Transactional bao ngoài — mỗi save() tự quản transaction.
     */
    void generateRange(LocalDate today) {
        try {
            LocalDate end = today.plusDays(LOOKAHEAD_DAYS);
            // Lấy luôn 7 ngày trước để có template cùng thứ, chỉ 1 query.
            List<ChiTietChuyenBay> window =
                    chiTietChuyenBayRepository.findByNgayDiBetween(today.minusDays(7), end);

            Map<LocalDate, List<ChiTietChuyenBay>> byDate = window.stream()
                    .collect(Collectors.groupingBy(ChiTietChuyenBay::getNgayDi));
            Set<LocalDate> existingDates = new HashSet<>(byDate.keySet());

            LocalDate fallbackDate = null;
            List<ChiTietChuyenBay> fallbackTemplates = null;

            int created = 0;
            int skipped = 0;

            for (int i = 0; i <= LOOKAHEAD_DAYS; i++) {
                LocalDate targetDate = today.plusDays(i);
                if (existingDates.contains(targetDate)) {
                    continue;
                }

                List<ChiTietChuyenBay> templates =
                        byDate.getOrDefault(targetDate.minusDays(7), List.of());
                if (templates.isEmpty()) {
                    // Cold-start: chỉ query MAX 1 lần cho cả vòng lặp.
                    if (fallbackTemplates == null) {
                        fallbackDate = chiTietChuyenBayRepository.findMaxNgayDi();
                        fallbackTemplates = (fallbackDate == null)
                                ? List.of()
                                : byDate.getOrDefault(fallbackDate, List.of());
                        if (fallbackTemplates.isEmpty() && fallbackDate != null) {
                            fallbackTemplates =
                                    chiTietChuyenBayRepository.findByNgayDi(fallbackDate);
                        }
                    }
                    templates = fallbackTemplates;
                }
                if (templates.isEmpty()) {
                    log.warn("Không có chuyến bay mẫu để sinh lịch cho ngày {}", targetDate);
                    continue;
                }

                for (ChiTietChuyenBay template : templates) {
                    if (cloneFlight(template, targetDate)) {
                        created++;
                        // Đánh dấu ngày đã có chuyến để tránh sinh trùng trong cùng lần chạy.
                        existingDates.add(targetDate);
                    } else {
                        skipped++;
                    }
                }
            }

            log.info("Sinh chuyến bay tương lai xong: tạo mới {} chuyến, bỏ qua {} (trùng lịch)",
                    created, skipped);
        } catch (Exception e) {
            log.error("Lỗi trong FlightAutoGenerationScheduler", e);
        }
    }

    /**
     * Clone 1 chuyến bay mẫu sang ngày đích. Trả về false nếu trùng số hiệu
     * hoặc trùng lịch máy bay (buffer 30 phút theo rule hiện có).
     * Mỗi save() là 1 transaction riêng của repository.
     */
    boolean cloneFlight(ChiTietChuyenBay template, LocalDate targetDate) {
        LocalDate arrivalDate = targetDate.plusDays(
                template.getNgayDen().toEpochDay() - template.getNgayDi().toEpochDay());

        if (chiTietChuyenBayRepository.existsBySoHieuChuyenBayAndNgayDiAndGioDiAndNgayDenAndGioDen(
                template.getSoHieuChuyenBay(), targetDate, template.getGioDi(),
                arrivalDate, template.getGioDen())) {
            return false;
        }

        if (template.getMayBay() != null && chiTietChuyenBayRepository.existsAircraftScheduleConflict(
                template.getMayBay().getMaMayBay(), targetDate, template.getGioDi(),
                arrivalDate, template.getGioDen(), null) > 0) {
            log.warn("Bỏ qua chuyến {} ngày {}: trùng lịch máy bay {}",
                    template.getSoHieuChuyenBay(), targetDate, template.getMayBay().getMaMayBay());
            return false;
        }

        ChiTietChuyenBay flight = new ChiTietChuyenBay();
        flight.setTuyenBay(template.getTuyenBay());
        flight.setMayBay(template.getMayBay());
        flight.setSoHieuChuyenBay(template.getSoHieuChuyenBay());
        flight.setNgayDi(targetDate);
        flight.setNgayDen(arrivalDate);
        flight.setGioDi(template.getGioDi());
        flight.setGioDen(template.getGioDen());
        flight.setTrangThai(TRANG_THAI_MO_BAN);
        // Clone dịch vụ đi kèm (join table dichvuchuyenbay), giá ăn theo TuyenBay nên không cần copy.
        if (template.getDichVuCungCap() != null && !template.getDichVuCungCap().isEmpty()) {
            flight.setDichVuCungCap(new HashSet<>(template.getDichVuCungCap()));
        }
        flight.setDaXoa(false);
        flight.setDeletedAt(null);
        chiTietChuyenBayRepository.save(flight);
        return true;
    }
}
