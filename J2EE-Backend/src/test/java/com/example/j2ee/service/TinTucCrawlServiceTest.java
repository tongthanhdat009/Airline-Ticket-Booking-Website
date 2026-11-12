package com.example.j2ee.service;

import com.example.j2ee.repository.TinTucRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests cho logic thuan tuy cua TinTucCrawlService
 * (parse RSS, chuan hoa tieu de, near-duplicate). Khong cham network/DB/LLM.
 */
@ExtendWith(MockitoExtension.class)
class TinTucCrawlServiceTest {

    @Mock
    private TinTucRepository tinTucRepository;

    @Mock
    private TinTucService tinTucService;

    @Mock
    private AdvisorChatService advisorChatService;

    @InjectMocks
    private TinTucCrawlService crawlService;

    @BeforeEach
    void setUp() {
        // Mo phong @Value nhu production (prompt that).
        ReflectionTestUtils.setField(crawlService, "relevanceSystemPrompt", "TEST PROMPT");
    }

    @Test
    void parseRss_trichXuatItemVaAnh() throws Exception {
        String xml = """
                <?xml version="1.0" encoding="UTF-8"?>
                <rss version="2.0">
                  <channel><title>Du lich</title>
                    <item>
                      <title>Mo them duong bay Ha Noi - Da Nang</title>
                      <link>https://example.com/bai-1</link>
                      <description><![CDATA[<img src="https://example.com/a.jpg"/>Mo ta ngan]]></description>
                      <pubDate>Mon, 10 Nov 2025 08:00:00 +0700</pubDate>
                    </item>
                    <item>
                      <title></title>
                      <link>https://example.com/bai-2</link>
                      <description>Khong co tieu de</description>
                      <pubDate></pubDate>
                    </item>
                  </channel>
                </rss>
                """;

        List<TinTucCrawlService.RssItem> items = crawlService.parseRss(xml, "VnExpress");

        assertEquals(1, items.size());
        assertEquals("Mo them duong bay Ha Noi - Da Nang", items.get(0).title());
        assertEquals("https://example.com/bai-1", items.get(0).link());
        assertEquals("https://example.com/a.jpg", items.get(0).imageUrl());
    }

    @Test
    void normalizeTitle_boDauVaKyTuDacBiet() {
        assertEquals("ha noi da nang",
                TinTucCrawlService.normalizeTitle("Hà Nội – Đà Nẵng!"));
        assertEquals("ha noi da nang",
                TinTucCrawlService.normalizeTitle("  HA NOI - DA NANG  "));
    }

    @Test
    void isNearDuplicate_cungSuKienKhacCachViet() {
        assertTrue(TinTucCrawlService.isNearDuplicate(
                "Mo them duong bay thang Ha Noi - Da Nang tu thang 12",
                "Tu thang 12 mo duong bay thang Ha Noi Da Nang"));
    }

    @Test
    void isNearDuplicate_khacSuKien() {
        assertFalse(TinTucCrawlService.isNearDuplicate(
                "Mo them duong bay thang Ha Noi - Da Nang",
                "Huong dan lam thu tuc check-in truc tuyen"));
    }

    @Test
    void isRelevantByLlm_llmBaoLienQuan() {
        org.mockito.Mockito.when(advisorChatService.complete(
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.eq(500), org.mockito.ArgumentMatchers.isNull()))
                .thenReturn("{\"relevant\": true}");

        assertTrue(crawlService.isRelevantByLlm(
                "Mo duong bay thang Ha Noi - Tokyo",
                "Hang hang khong mo duong bay thang..."));
    }

    @Test
    void isRelevantByLlm_llmBaoKhongLienQuan() {
        org.mockito.Mockito.when(advisorChatService.complete(
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.eq(500), org.mockito.ArgumentMatchers.isNull()))
                .thenReturn("Duy nhat mot JSON: {\"relevant\": false}");

        assertFalse(crawlService.isRelevantByLlm(
                "Le hoi am thuc pho co",
                "Le hoi am thuc voi hang tram mon an..."));
    }

    @Test
    void isRelevantByLlm_llmLoi_macDinhGiuBai() {
        org.mockito.Mockito.when(advisorChatService.complete(
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.eq(500), org.mockito.ArgumentMatchers.isNull()))
                .thenThrow(new RuntimeException("timeout"));

        assertTrue(crawlService.isRelevantByLlm("Tieu de bat ky", "Noi dung bat ky"));
    }
}
