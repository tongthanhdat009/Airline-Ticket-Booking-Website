package com.example.j2ee.service;

import com.example.j2ee.model.TinTuc;
import com.example.j2ee.repository.TinTucRepository;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Tự động crawl tin tức từ RSS các báo, dùng LLM (OpenAI-compatible)
 * viết lại + tóm tắt, dedup trước khi lưu vào bảng tin_tuc.
 *
 * Luồng: fetch RSS -> lọc tin mới -> dedup chính xác (tiêu đề) ->
 * dedup mờ (LLM judge) -> LLM viết lại -> lưu (mặc định tự xuất bản).
 */
@Service
@Slf4j
public class TinTucCrawlService {

    // Prompt mac dinh nam o cac field @Value ben duoi (custom duoc qua cau hinh).
    // Xem app.news-crawl.* trong application.properties.

    @Value("${app.news-crawl.sources:VnExpress|https://vnexpress.net/rss/du-lich.rss,VietnamNet|https://vietnamnet.vn/rss/du-lich.rss,TuoiTre|https://tuoitre.vn/rss/du-lich.rss}")
    private String sourcesConfig;

    @Value("${app.news-crawl.max-items-per-source:15}")
    private int maxItemsPerSource;

    @Value("${app.news-crawl.lookback-hours:72}")
    private int lookbackHours;

    @Value("${app.news-crawl.max-tokens:1500}")
    private int llmMaxTokens;

    @Value("${app.news-crawl.model:}")
    private String llmModelOverride;

    // Prompt co the custom qua cau hinh (mac dinh: chi tin lien quan may bay).
    // Ghi de trong application.properties/.env, viet 1 dong (khong xuong dong).
    @Value("${app.news-crawl.rewrite-system-prompt:Bạn là biên tập viên tin tức hàng không - du lịch của hãng JadT Airline. Viết lại bài báo sau thành tin tức tiếng Việt, văn phong báo chí ngắn gọn, trung lập. Bài PHẢI liên quan trực tiếp đến việc di chuyển bằng máy bay (chuyến bay, hãng hàng không, sân bay, vé máy bay, du lịch bằng đường hàng không); nếu bài gốc không liên quan, chỉ tóm tắt đúng phần liên quan, không bịa thêm. KHÔNG bịa thêm số liệu, KHÔNG chèn link, KHÔNG thêm lời bình ngoài bài. Trả về ĐÚNG định dạng 3 dòng đánh dấu sau (mỗi mục một dòng nội dung, nội dung NOI_DUNG có thể nhiều đoạn, mỗi đoạn một dòng, không dòng trắng): TIEU_DE: <tiêu đề không quá 120 ký tự> | TOM_TAT: <1-2 câu tóm tắt> | NOI_DUNG: <đoạn 1> <đoạn 2> ... (3-6 đoạn ngắn)}")
    private String rewriteSystemPrompt;

    @Value("${app.news-crawl.dedup-system-prompt:Bạn kiểm tra trùng lặp tin tức. Trả về DUY NHẤT một JSON: {\"duplicate\": true} hoặc {\"duplicate\": false}. duplicate=true khi 2 bài nói về CÙNG một sự kiện/cùng một thông tin cốt lõi (dù cách viết khác nhau).}")
    private String dedupSystemPrompt;

    @Value("${app.news-crawl.relevance-system-prompt:Bạn là bộ lọc tin tức hàng không của hãng JadT Airline. Trả về DUY NHẤT một JSON: {\"relevant\": true} hoặc {\"relevant\": false}. relevant=true CHỈ khi bài báo liên quan TRỰC TIẾP đến việc di chuyển bằng máy bay (chuyến bay, hãng hàng không, sân bay, vé máy bay, đặt vé, delay/hủy chuyến, giá vé, trải nghiệm bay, du lịch bằng đường hàng không). Tin du lịch nói chung, tàu xe, khách sạn, ẩm thực mà KHÔNG nhắc đến bay thì relevant=false.}")
    private String relevanceSystemPrompt;

    private final TinTucRepository tinTucRepository;
    private final TinTucService tinTucService;
    private final AdvisorChatService advisorChatService;
    private final HttpClient httpClient;

    public TinTucCrawlService(TinTucRepository tinTucRepository,
                              TinTucService tinTucService,
                              AdvisorChatService advisorChatService) {
        this.tinTucRepository = tinTucRepository;
        this.tinTucService = tinTucService;
        this.advisorChatService = advisorChatService;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    public record CrawlSummary(int fetched, int created, int skippedDuplicate, int skippedIrrelevant, int failed) {
    }

    public record RssItem(String title, String link, String description, String pubDate, String imageUrl) {
    }

    /**
     * Chạy crawl đầy đủ: fetch -> lọc -> dedup -> LLM viết lại -> lưu.
     */
    public CrawlSummary crawlNow() {
        int fetched = 0;
        int created = 0;
        int skippedDuplicate = 0;
        int skippedIrrelevant = 0;
        int failed = 0;

        List<TinTuc> recent = tinTucRepository.findTop200ByOrderByMaTinTucDesc();
        Set<String> normalizedExisting = new HashSet<>();
        for (TinTuc t : recent) {
            normalizedExisting.add(normalizeTitle(t.getTieuDe()));
        }

        List<String[]> sources = parseSources();
        List<RssItem> freshItems = new ArrayList<>();
        List<String> freshSources = new ArrayList<>();
        for (String[] source : sources) {
            String sourceName = source[0];
            String url = source[1];
            List<RssItem> items;
            try {
                items = parseRss(fetchRss(url), sourceName);
            } catch (Exception e) {
                log.error("Crawl tin tuc: khong tai duoc RSS {}: {}", url, e.getMessage());
                failed++;
                continue;
            }
            fetched += items.size();
            int processed = 0;
            for (RssItem item : items) {
                if (processed >= maxItemsPerSource) break;
                if (!isFresh(item)) continue;
                processed++;
                freshItems.add(item);
                freshSources.add(sourceName);
            }
        }

        // Kiem tra nhanh LLM truoc khi xu ly: LLM chet thi bo qua viet lai,
        // tranh moi bai dot 3 lan timeout.
        final boolean llmOk;
        if (!freshItems.isEmpty()) {
            llmOk = llmAvailable();
            if (!llmOk) {
                log.error("Crawl tin tuc: LLM khong kha dung, bo qua {} bai (van giu {} bai trung da loai).",
                        freshItems.size(), skippedDuplicate);
            }
        } else {
            llmOk = true;
        }

        for (int i = 0; i < freshItems.size(); i++) {
            RssItem item = freshItems.get(i);
            String sourceName = freshSources.get(i);
            String normalized = normalizeTitle(item.title());
            if (normalized.isEmpty() || normalizedExisting.contains(normalized)
                    || tinTucRepository.existsByTieuDe(item.title())) {
                skippedDuplicate++;
                continue;
            }
            if (!llmOk) {
                failed++;
                continue;
            }
            if (!isRelevantByLlm(item.title(), item.description())) {
                normalizedExisting.add(normalized);
                skippedIrrelevant++;
                continue;
            }
            try {
                if (isNearDuplicateOfRecent(item.title(), recent) && isDuplicateByLlm(item.title(), recent)) {
                    normalizedExisting.add(normalized);
                    skippedDuplicate++;
                    continue;
                }
                RewrittenArticle rewritten = rewriteByLlm(item);
                if (rewritten == null || rewritten.title().isBlank() || rewritten.body().isBlank()) {
                    failed++;
                    continue;
                }
                if (tinTucRepository.existsByTieuDe(rewritten.title())) {
                    skippedDuplicate++;
                    continue;
                }
                saveCrawled(rewritten, item, sourceName);
                normalizedExisting.add(normalizeTitle(rewritten.title()));
                created++;
            } catch (Exception e) {
                log.error("Crawl tin tuc: loi xu ly bai '{}': {}", item.title(), e.getMessage());
                failed++;
            }
        }

        log.info("Crawl tin tuc xong: fetched={} created={} duplicate={} irrelevant={} failed={}",
                fetched, created, skippedDuplicate, skippedIrrelevant, failed);
        return new CrawlSummary(fetched, created, skippedDuplicate, skippedIrrelevant, failed);
    }

    /**
     * Goi 1 cau cuc nhe de biet LLM con song khong.
     * Tra ve false khi timeout/loi ket noi thay vi de moi bai dot 3 lan timeout.
     */
    private boolean llmAvailable() {
        // Ping nhe de biet LLM con song khong (du token cho model reasoning suy luan).
        try {
            String out = advisorChatService.complete("Tra loi dung mot tu: OK", "ping", 300, llmModelOverride);
            return out != null && !out.isBlank();
        } catch (Exception e) {
            log.error("LLM judge/ping that bai (se bo qua viet lai toan bo dot nay): {}", e.getMessage());
            return false;
        }
    }

    @Transactional
    protected void saveCrawled(RewrittenArticle rewritten, RssItem item, String sourceName) {
        TinTuc tinTuc = new TinTuc();
        tinTuc.setTieuDe(rewritten.title());
        tinTuc.setTomTat(rewritten.summary());
        tinTuc.setNoiDung(rewritten.body());
        tinTuc.setHinhAnh(item.imageUrl());
        tinTuc.setDanhMuc("Tin tức");
        tinTuc.setTrangThai("da_xuat_ban");
        tinTuc.setNgayDang(LocalDateTime.now());
        tinTuc.setLuotXem(0);
        tinTuc.setTacGia(sourceName + " (auto)");
        tinTucService.createTinTuc(tinTuc);
    }

    // ==================== RSS ====================

    protected String fetchRss(String url) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(15))
                .header("User-Agent", "JadTAirline-NewsCrawler/1.0")
                .header("Accept", "application/rss+xml, application/xml, text/xml")
                .GET()
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("HTTP " + response.statusCode());
        }
        return response.body();
    }

    List<RssItem> parseRss(String xml, String sourceName) throws Exception {
        List<RssItem> items = new ArrayList<>();
        if (xml == null || xml.isBlank()) return items;

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setExpandEntityReferences(false);
        Document doc = factory.newDocumentBuilder()
                .parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));
        NodeList nodes = doc.getElementsByTagName("item");
        for (int i = 0; i < nodes.getLength(); i++) {
            Element el = (Element) nodes.item(i);
            String title = textOf(el, "title");
            String link = textOf(el, "link");
            String description = textOf(el, "description");
            String pubDate = textOf(el, "pubDate");
            if (title.isBlank() || link.isBlank()) continue;
            items.add(new RssItem(title.trim(), link.trim(), description.trim(),
                    pubDate.trim(), extractImage(el, description)));
        }
        log.info("Crawl tin tuc: {} co {} tin RSS", sourceName, items.size());
        return items;
    }

    private String textOf(Element parent, String tag) {
        NodeList nodes = parent.getElementsByTagName(tag);
        if (nodes.getLength() == 0) return "";
        String text = nodes.item(0).getTextContent();
        return text != null ? text : "";
    }

    private String extractImage(Element itemEl, String description) {
        NodeList enclosures = itemEl.getElementsByTagName("enclosure");
        for (int i = 0; i < enclosures.getLength(); i++) {
            String url = ((Element) enclosures.item(i)).getAttribute("url");
            if (url != null && url.matches("(?i)^https?://.*\\.(jpg|jpeg|png|webp)(\\?.*)?$")) {
                return url;
            }
        }
        NodeList media = itemEl.getElementsByTagName("media:content");
        for (int i = 0; i < media.getLength(); i++) {
            String url = ((Element) media.item(i)).getAttribute("url");
            if (url != null && !url.isBlank()) return url;
        }
        if (description != null && !description.isBlank()) {
            try {
                org.jsoup.nodes.Document doc = Jsoup.parseBodyFragment(description);
                org.jsoup.nodes.Element img = doc.selectFirst("img[src]");
                if (img != null) return img.attr("abs:src").isBlank() ? img.attr("src") : img.attr("abs:src");
            } catch (Exception e) {
                log.debug("Khong trich duoc anh tu mo ta RSS: {}", e.getMessage());
            }
        }
        return null;
    }

    private List<String[]> parseSources() {
        List<String[]> sources = new ArrayList<>();
        if (sourcesConfig == null || sourcesConfig.isBlank()) return sources;
        for (String part : sourcesConfig.split(",")) {
            String[] kv = part.split("\\|", 2);
            if (kv.length == 2 && !kv[0].isBlank() && !kv[1].isBlank()) {
                sources.add(new String[]{kv[0].trim(), kv[1].trim()});
            }
        }
        return sources;
    }

    private boolean isFresh(RssItem item) {
        if (item.pubDate() == null || item.pubDate().isBlank()) return true;
        try {
            ZonedDateTime published = ZonedDateTime.parse(item.pubDate().trim(),
                    DateTimeFormatter.RFC_1123_DATE_TIME.withLocale(Locale.ENGLISH));
            return !published.toLocalDateTime().isBefore(LocalDateTime.now().minusHours(lookbackHours));
        } catch (DateTimeParseException e) {
            return true;
        }
    }

    // ==================== DEDUP ====================

    static String normalizeTitle(String title) {
        if (title == null) return "";
        String s = title.toLowerCase(Locale.ROOT).trim();
        // Tach dau tieng Viet de so khop "Ha Noi" ~ "Hà Nội"
        // (chu "đ" khong phan ra duoc qua NFD nen map tay)
        s = java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        s = s.replace('đ', 'd').replace('Đ', 'D');
        s = s.replaceAll("[^\\p{L}\\p{Nd} ]+", " ");
        return s.replaceAll("\\s+", " ").trim();
    }

    static boolean isNearDuplicate(String a, String b) {
        Set<String> ta = tokens(a);
        Set<String> tb = tokens(b);
        if (ta.isEmpty() || tb.isEmpty()) return false;
        Set<String> inter = new HashSet<>(ta);
        inter.retainAll(tb);
        Set<String> union = new HashSet<>(ta);
        union.addAll(tb);
        return (double) inter.size() / union.size() >= 0.6;
    }

    private static Set<String> tokens(String title) {
        Set<String> out = new HashSet<>();
        for (String w : normalizeTitle(title).split(" ")) {
            if (w.length() > 2) out.add(w);
        }
        return out;
    }

    private boolean isNearDuplicateOfRecent(String title, List<TinTuc> recent) {
        for (TinTuc t : recent) {
            if (isNearDuplicate(title, t.getTieuDe())) return true;
        }
        return false;
    }

    private boolean isDuplicateByLlm(String title, List<TinTuc> recent) {
        StringBuilder sb = new StringBuilder("Bài mới: ").append(title).append("\nBài đã có:\n");
        int n = 0;
        for (TinTuc t : recent) {
            if (t.getTieuDe() == null || n >= 20) break;
            if (isNearDuplicate(title, t.getTieuDe())) {
                sb.append("- ").append(t.getTieuDe()).append("\n");
                n++;
            }
        }
        if (n == 0) return false;
        try {
            // Judge can la JSON rat ngan nhung model reasoning van dot token suy luan truoc.
            String answer = advisorChatService.complete(dedupSystemPrompt, sb.toString(), 500, llmModelOverride);
            return answer != null && answer.toLowerCase(Locale.ROOT).contains("\"duplicate\": true");
        } catch (Exception e) {
            log.warn("LLM judge dedup that bai, mac dinh la bai moi: {}", e.getMessage());
            return false;
        }
    }

    /**
     * LLM judge: bai co lien quan den di lai bang may bay khong.
     * Loi LLM -> mac dinh la LIEN QUAN (fail-open) de tranh mat tin;
     * dedup + rewrite van bao ve o buoc sau.
     */
    boolean isRelevantByLlm(String title, String description) {
        // Prompt rong = tat bo loc lien quan (giu tat ca bai).
        if (relevanceSystemPrompt == null || relevanceSystemPrompt.isBlank()) {
            return true;
        }
        String plain = description != null
                ? org.jsoup.Jsoup.parseBodyFragment(description).text()
                : "";
        if (plain.length() > 1000) {
            plain = plain.substring(0, 1000);
        }
        String input = "Tiêu đề: " + (title != null ? title : "") + "\nNội dung: " + plain;
        try {
            // Judge can la JSON rat ngan nhung model reasoning van dot token suy luan truoc.
            String answer = advisorChatService.complete(relevanceSystemPrompt, input, 500, llmModelOverride);
            return answer == null || !answer.toLowerCase(Locale.ROOT).contains("\"relevant\": false");
        } catch (Exception e) {
            log.warn("LLM judge relevance that bai, mac dinh la lien quan: {}", e.getMessage());
            return true;
        }
    }

    // ==================== LLM REWRITE ====================

    record RewrittenArticle(String title, String summary, String body) {
    }

    private RewrittenArticle rewriteByLlm(RssItem item) {
        String plain = Jsoup.parseBodyFragment(item.description() != null ? item.description() : "").text();
        String input = "Nguồn: " + item.link() + "\nTiêu đề gốc: " + item.title() + "\nNội dung: " + plain;
        Exception lastError = null;
        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                String out = advisorChatService.complete(rewriteSystemPrompt, input, llmMaxTokens, llmModelOverride);
                RewrittenArticle parsed = parseRewrite(out);
                if (parsed != null && !parsed.title().isBlank() && !parsed.body().isBlank()) {
                    return parsed;
                }
                lastError = new IllegalStateException("LLM tra ve thieu TIEU_DE/NOI_DUNG");
            } catch (Exception e) {
                lastError = e;
                log.warn("LLM viet lai lan {} that bai '{}': {}", attempt, item.title(), e.getMessage());
            }
            try {
                Thread.sleep(attempt * 2000L);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        log.error("LLM viet lai tin that bai '{}' sau 3 lan thu: {}", item.title(),
                lastError != null ? lastError.getMessage() : "unknown");
        return null;
    }

    private RewrittenArticle parseRewrite(String out) {
        if (out == null || out.isBlank()) return null;
        String title = null;
        String summary = "";
        StringBuilder body = new StringBuilder();
        String section = "";
        for (String line : out.split("\n")) {
            String t = line.trim();
            if (t.startsWith("TIEU_DE:")) {
                title = t.substring("TIEU_DE:".length()).trim();
                section = "title";
            } else if (t.startsWith("TOM_TAT:")) {
                summary = t.substring("TOM_TAT:".length()).trim();
                section = "summary";
            } else if (t.startsWith("NOI_DUNG:")) {
                String rest = t.substring("NOI_DUNG:".length()).trim();
                if (!rest.isEmpty()) body.append(rest).append("\n");
                section = "body";
            } else if (!t.isEmpty() && section.equals("body")) {
                body.append(t).append("\n");
            } else if (!t.isEmpty() && section.equals("summary") && summary.isEmpty()) {
                summary = t;
            }
        }
        if (title == null || title.isBlank()) return null;
        return new RewrittenArticle(title.trim(), summary.trim(), body.toString().trim());
    }
}
