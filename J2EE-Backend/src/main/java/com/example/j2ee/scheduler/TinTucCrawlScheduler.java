package com.example.j2ee.scheduler;

import com.example.j2ee.service.TinTucCrawlService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Job tự động crawl tin tức từ RSS các báo (mặc định mỗi 6 giờ).
 * Bật/tắt và giờ chạy cấu hình qua app.news-crawl.* (xem application.properties).
 * Không chạy bù khi khởi động - chỉ chạy theo lịch và khi admin bấm "Crawl ngay".
 */
@Component
@ConditionalOnProperty(value = "app.news-crawl.enabled", havingValue = "true", matchIfMissing = true)
@Slf4j
public class TinTucCrawlScheduler {

    private final TinTucCrawlService tinTucCrawlService;

    public TinTucCrawlScheduler(TinTucCrawlService tinTucCrawlService) {
        this.tinTucCrawlService = tinTucCrawlService;
    }

    @Scheduled(cron = "${app.news-crawl.cron:0 0 */6 * * *}", zone = "Asia/Ho_Chi_Minh")
    public void crawlScheduled() {
        log.info("Bat dau crawl tin tuc dinh ky");
        try {
            TinTucCrawlService.CrawlSummary summary = tinTucCrawlService.crawlNow();
            log.info("Crawl tin tuc dinh ky xong: fetched={} created={} duplicate={} irrelevant={} failed={}",
                    summary.fetched(), summary.created(), summary.skippedDuplicate(),
                    summary.skippedIrrelevant(), summary.failed());
        } catch (Exception e) {
            log.error("Crawl tin tuc dinh ky that bai: {}", e.getMessage(), e);
        }
    }
}
