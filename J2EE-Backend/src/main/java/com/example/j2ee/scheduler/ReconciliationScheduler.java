package com.example.j2ee.scheduler;

import com.example.j2ee.dto.doi_soat.DoiSoatResponse;
import com.example.j2ee.dto.doi_soat.RunReconciliationRequest;
import com.example.j2ee.service.DoiSoatGiaoDichService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Scheduler tự động đối soát giao dịch
 * Chạy đối soát tự động mỗi ngày lúc 2:00 AM
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReconciliationScheduler {

    private final DoiSoatGiaoDichService doiSoatGiaoDichService;

    /**
     * Chạy đối soát tự động mỗi ngày lúc 2:00 AM
     * Cron expression: "0 0 2 * * ?"
     * - 0: giây thứ 0
     * - 0: phút thứ 0
     * - 2: giờ thứ 2 (2 AM)
     * - *: mọi ngày
     * - *: mọi tháng
     * - ?: không cụ thể ngày trong tuần
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void autoReconcile() {
        log.info("========== BẮT ĐẦU ĐỐI SOÁT TỰ ĐỘNG ==========");

        try {
            // Đối soát ngày hôm qua
            LocalDate yesterday = LocalDate.now().minusDays(1);

            log.info("Đối soát cho ngày: {}", yesterday);

            RunReconciliationRequest request = RunReconciliationRequest.builder()
                    .tuNgay(yesterday)
                    .denNgay(yesterday)
                    .includeMatched(false) // Chỉ lấy các giao dịch lệch
                    .build();

            List<DoiSoatResponse> results = doiSoatGiaoDichService.runManualReconciliation(request);

            // Đếm số giao dịch lệch
            long unmatchedCount = results.stream()
                    .filter(r -> !"MATCHED".equals(r.getStatus()))
                    .count();

            log.info("KẾT QUẢ ĐỐI SOÁT:");
            log.info("- Tổng số giao dịch: {}", results.size());
            log.info("- Số giao dịch khớp: {}", results.size() - unmatchedCount);
            log.info("- Số giao dịch lệch: {}", unmatchedCount);

            // TODO: Gửi email thông báo cho kế toán nếu có giao dịch lệch
            if (unmatchedCount > 0) {
                log.warn("CÓ {} GIAO DỊCH LỆCH CẦN XỬ LÝ!", unmatchedCount);
                // Có thể tích hợp với EmailService ở đây
                // emailService.sendReconciliationAlert(results, unmatchedCount);
            } else {
                log.info("TẤT CẢ GIAO DỊCH ĐỀU KHỚP!");
            }

            log.info("========== HOÀN TẤT ĐỐI SOÁT TỰ ĐỘNG ==========");

        } catch (Exception e) {
            log.error("LỖI KHI ĐỐI SOÁT TỰ ĐỘNG: {}", e.getMessage(), e);
        }
    }

    /**
     * Chạy đối soát thử nghiệm mỗi 5 phút (chỉ用于 development)
     * Comment out this method in production
     */
    // @Scheduled(fixedRate = 300000) // 5 minutes
    public void testReconcile() {
        log.info("[TEST] Running test reconciliation...");
        // Uncomment to test during development
        // autoReconcile();
    }

    /**
     * Chạy đối soát đầy đủ hàng tuần vào Chủ nhật lúc 3:00 AM
     * Cron expression: "0 0 3 ? * SUN"
     */
    @Scheduled(cron = "0 0 3 ? * SUN")
    public void weeklyFullReconciliation() {
        log.info("========== BẮT ĐẦU ĐỐI SOÁT HÀNG TUẦN ==========");

        try {
            // Đối soát cả tuần vừa qua
            LocalDate startOfWeek = LocalDate.now().minusWeeks(1);
            LocalDate endOfWeek = LocalDate.now().minusDays(1);

            log.info("Đối soát từ ngày {} đến ngày {}", startOfWeek, endOfWeek);

            RunReconciliationRequest request = RunReconciliationRequest.builder()
                    .tuNgay(startOfWeek)
                    .denNgay(endOfWeek)
                    .includeMatched(false) // Chỉ lấy các giao dịch lệch
                    .build();

            List<DoiSoatResponse> results = doiSoatGiaoDichService.runManualReconciliation(request);

            long unmatchedCount = results.stream()
                    .filter(r -> !"MATCHED".equals(r.getStatus()))
                    .count();

            log.info("KẾT QUẢ ĐỐI SOÁT TUẦN:");
            log.info("- Tổng số giao dịch: {}", results.size());
            log.info("- Số giao dịch lệch: {}", unmatchedCount);

            log.info("========== HOÀN TẤT ĐỐI SOÁT TUẦN ==========");

        } catch (Exception e) {
            log.error("LỖI KHI ĐỐI SOÁT TUẦN: {}", e.getMessage(), e);
        }
    }
}
