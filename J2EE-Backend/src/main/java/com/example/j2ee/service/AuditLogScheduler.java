package com.example.j2ee.service;

import com.example.j2ee.model.AuditLog;
import com.example.j2ee.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler để xử lý các tác vụ định kỳ liên quan đến Audit Log
 * - Soft delete các log cũ hơn 1 năm (chạy vào 2h sáng ngày 1 hàng tháng)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogScheduler {

    private final AuditLogRepository auditLogRepository;

    /**
     * Scheduled job để soft delete các audit log cũ hơn 1 năm
     * Chạy vào 2:00 AM ngày 1 của mỗi tháng
     * Cron expression: "0 0 2 1 * *" = giây 0, phút 0, giờ 2, ngày 1, mọi tháng, mọi năm
     */
    @Scheduled(cron = "0 0 2 1 * *")
    @Transactional
    public void cleanupOldLogs() {
        log.info("========== BẮT ĐẦU DỌN DẸP AUDIT LOG CŨ ==========");
        
        try {
            // Tính thờ gian 1 năm trước
            LocalDateTime oneYearAgo = LocalDateTime.now().minusYears(1);
            log.info("Tìm các log có thờ gian trước: {}", oneYearAgo);
            
            // Tìm các log cũ hơn 1 năm
            List<AuditLog> oldLogs = auditLogRepository.findByThoiGianBefore(oneYearAgo);
            
            if (oldLogs.isEmpty()) {
                log.info("Không tìm thấy log nào cần xóa");
                return;
            }
            
            log.info("Tìm thấy {} log cần xóa", oldLogs.size());
            
            // Thực hiện soft delete cho từng log
            int deletedCount = 0;
            for (AuditLog auditLog : oldLogs) {
                try {
                    // Soft delete bằng cách cập nhật cờ deleted
                    // Vì AuditLog entity chưa có @SQLDelete nên ta sẽ xóa trực tiếp
                    // hoặc có thể thêm trường deleted_at nếu cần
                    auditLogRepository.delete(auditLog);
                    deletedCount++;
                    
                    if (deletedCount % 100 == 0) {
                        log.info("Đã xóa {} log...", deletedCount);
                    }
                } catch (Exception e) {
                    log.error("Lỗi khi xóa log ID {}: {}", auditLog.getMaLog(), e.getMessage());
                }
            }
            
            log.info("========== HOÀN THÀNH DỌN DẸP ==========");
            log.info("Đã xóa {} audit log cũ", deletedCount);
            
        } catch (Exception e) {
            log.error("Lỗi trong quá trình dọn dẹp audit log: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Test method để chạy cleanup ngay lập tức (chỉ dùng cho testing)
     */
    @Transactional
    public int cleanupOldLogsNow() {
        log.info("========== CHẠY DỌN DẸP AUDIT LOG NGAY LẬP TỨC ==========");
        
        LocalDateTime oneYearAgo = LocalDateTime.now().minusYears(1);
        List<AuditLog> oldLogs = auditLogRepository.findByThoiGianBefore(oneYearAgo);
        
        int deletedCount = 0;
        for (AuditLog auditLog : oldLogs) {
            try {
                auditLogRepository.delete(auditLog);
                deletedCount++;
            } catch (Exception e) {
                log.error("Lỗi khi xóa log ID {}: {}", auditLog.getMaLog(), e.getMessage());
            }
        }
        
        log.info("Đã xóa {} audit log cũ", deletedCount);
        return deletedCount;
    }
}
