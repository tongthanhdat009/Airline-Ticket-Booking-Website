package com.example.j2ee.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service tư vấn vé máy bay bằng LLM qua gateway 9router
 * (chuẩn OpenAI-compatible: POST {baseUrl}/chat/completions).
 * Stateless: lịch sử chat do frontend gửi kèm mỗi request.
 */
@Service
@Slf4j
public class AdvisorChatService {

    private static final String SYSTEM_PROMPT_VI = """
            Bạn là trợ lý tư vấn đặt vé máy bay của hãng JadT Airline, trả lời bằng tiếng Việt.
            PHẠM VI: tìm/đặt/đổi/hủy vé, hoàn tiền, hành lý, chỗ ngồi, suất ăn, check-in,
            lịch bay, delay/hủy chuyến, thanh toán, hóa đơn, khuyến mãi, tài khoản website.
            NGUYÊN TẮC: ngắn gọn, thân thiện, lịch sự; nếu thiếu thông tin thì hỏi lại;
            không tư vấn ngoài phạm vi hàng không; không hứa hẹn ngoài quy định.
            """;

    private static final String SYSTEM_PROMPT_EN = """
            You are the flight booking assistant of JadT Airline, always reply in English.
            SCOPE: searching/booking/changing/cancelling tickets, refunds, baggage, seats,
            meals, check-in, flight schedules, delays/cancellations, payments, invoices,
            promotions, website accounts.
            RULES: concise, friendly, polite; ask back when information is missing;
            no advice outside the airline scope; no promises beyond regulations.
            """;

    /**
     * Chọn system prompt theo ngôn ngữ yêu cầu ("en" → tiếng Anh, còn lại tiếng Việt).
     */
    static String systemPromptFor(String language) {
        return "en".equalsIgnoreCase(language) ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_VI;
    }

    @Value("${advisor.llm.base-url:http://localhost:20128/v1}")
    private String baseUrl;

    @Value("${advisor.llm.api-key:}")
    private String apiKey;

    @Value("${advisor.llm.model:wq}")
    private String model;

    @Value("${advisor.llm.temperature:0.7}")
    private double temperature;

    @Value("${advisor.llm.max-tokens:1024}")
    private int maxTokens;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Gửi tin nhắn của khách tới LLM và trả về câu trả lời.
     *
     * @param message tin nhắn mới nhất của khách
     * @param history lịch sử [{role, content}] (role = user|assistant), có thể null
     * @param language "en" để trả lời tiếng Anh, còn lại tiếng Việt
     */
    public AdvisorReply ask(String message, List<ChatTurn> history, String language) {
        long start = System.currentTimeMillis();

        Map<String, Object> body = buildRequestBody(message, history, language, false);

        try {
            RestClient client = RestClient.builder()
                    .baseUrl(chatCompletionsUrl())
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .build();

            RestClient.RequestBodySpec spec = client.post().body(body);
            if (apiKey != null && !apiKey.isBlank()) {
                spec = spec.header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey);
            }

            String raw = spec.retrieve().body(String.class);
            String reply = extractContent(raw);
            long ms = System.currentTimeMillis() - start;
            log.info("Advisor chat replied in {}ms (model={})", ms, model);
            return new AdvisorReply(reply, model);
        } catch (Exception e) {
            log.error("Advisor LLM call failed (baseUrl={}): {}", baseUrl, e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Trợ lý AI tạm thời không khả dụng. Vui lòng thử lại sau hoặc liên hệ tổng đài hỗ trợ.");
        }
    }

    private String chatCompletionsUrl() {
        return baseUrl.endsWith("/") ? baseUrl + "chat/completions" : baseUrl + "/chat/completions";
    }

    private String postChatCompletions(Map<String, Object> body) {
        org.springframework.http.client.SimpleClientHttpRequestFactory requestFactory =
                new org.springframework.http.client.SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(java.time.Duration.ofSeconds(10));
        // Timeout doc ngan cho tac vu nen (crawl tin): chi complete() dung duong nay,
        // chat hoi dap (ask) dung client rieng khong anh huong.
        requestFactory.setReadTimeout(java.time.Duration.ofSeconds(45));
        RestClient client = RestClient.builder()
                .baseUrl(chatCompletionsUrl())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .requestFactory(requestFactory)
                .build();

        RestClient.RequestBodySpec spec = client.post().body(body);
        if (apiKey != null && !apiKey.isBlank()) {
            spec = spec.header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey);
        }
        return spec.retrieve().body(String.class);
    }

    /**
     * Gọi LLM với system prompt tùy ý (dùng cho tác vụ nội bộ như viết lại tin tức,
     * không gắn với hội thoại tư vấn khách hàng).
     *
     * @param systemPrompt chỉ dẫn hệ thống cho tác vụ
     * @param userContent nội dung đầu vào (tự cắt ở 6000 ký tự)
     * @param maxTokensOverride giới hạn token đầu ra (null = dùng 1500)
     * @return nội dung text LLM trả về
     */
    public String complete(String systemPrompt, String userContent, Integer maxTokensOverride) {
        return complete(systemPrompt, userContent, maxTokensOverride, null);
    }

    /**
     * Như {@link #complete(String, String, Integer)} nhưng cho phép chỉ định model
     * (vd crawl dùng model rẻ/nhanh riêng thay vì model chat).
     *
     * @param modelOverride tên model gửi kèm request (null/blank = dùng model mặc định)
     */
    public String complete(String systemPrompt, String userContent, Integer maxTokensOverride, String modelOverride) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        String content = userContent == null ? "" : userContent;
        if (content.length() > 6000) {
            content = content.substring(0, 6000);
        }
        messages.add(Map.of("role", "user", "content", content));

        Map<String, Object> body = new HashMap<>();
        body.put("model", (modelOverride != null && !modelOverride.isBlank()) ? modelOverride : model);
        body.put("messages", messages);
        body.put("temperature", 0.3);
        body.put("max_tokens", maxTokensOverride != null ? maxTokensOverride : 1500);
        body.put("stream", false);

        try {
            String raw = postChatCompletions(body);
            return extractContent(raw);
        } catch (Exception e) {
            log.error("Advisor LLM complete failed (baseUrl={}): {}", baseUrl, e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Trợ lý AI tạm thời không khả dụng. Vui lòng thử lại sau.");
        }
    }
    private Map<String, Object> buildRequestBody(String message, List<ChatTurn> history, String language, boolean stream) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPromptFor(language)));
        if (history != null) {
            // Chỉ giữ 10 turns gần nhất để giới hạn context
            int from = Math.max(0, history.size() - 10);
            for (int i = from; i < history.size(); i++) {
                ChatTurn t = history.get(i);
                if (t == null || t.getContent() == null || t.getContent().isBlank()) continue;
                String role = "assistant".equalsIgnoreCase(t.getRole()) ? "assistant" : "user";
                String content = t.getContent().length() > 2000
                        ? t.getContent().substring(0, 2000) : t.getContent();
                messages.add(Map.of("role", role, "content", content));
            }
        }
        String userContent = message.length() > 2000 ? message.substring(0, 2000) : message;
        messages.add(Map.of("role", "user", "content", userContent));

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", messages);
        body.put("temperature", temperature);
        body.put("max_tokens", maxTokens);
        body.put("stream", stream);
        return body;
    }

    private String extractContent(String raw) {
        try {
            StringBuilder sb = new StringBuilder();
            String trimmed = raw == null ? "" : raw.trim();
            if (trimmed.startsWith("data:")) {
                // 9router có thể trả SSE stream (data: {...}) dù đã gửi stream:false:
                // gom content từ mọi chunk, bỏ qua [DONE].
                for (String line : trimmed.split("\n")) {
                    line = line.trim();
                    if (!line.startsWith("data:")) continue;
                    String payload = line.substring(5).trim();
                    if (payload.isEmpty() || "[DONE]".equals(payload)) continue;
                    appendChoiceContent(objectMapper.readTree(payload), sb);
                }
            } else {
                appendChoiceContent(objectMapper.readTree(trimmed), sb);
            }
            String reply = sb.toString().trim();
            if (!reply.isBlank()) return reply;
        } catch (Exception e) {
            log.warn("Parse advisor LLM response failed: {}", e.getMessage());
        }
        throw new RuntimeException("Trợ lý AI trả về phản hồi không hợp lệ. Vui lòng thử lại.");
    }

    private void appendChoiceContent(JsonNode root, StringBuilder sb) {
        for (JsonNode choice : root.path("choices")) {
            JsonNode message = choice.path("message").path("content");
            if (message.isTextual() && !message.asText().isBlank()) sb.append(message.asText());
            JsonNode delta = choice.path("delta").path("content");
            if (delta.isTextual() && !delta.asText().isBlank()) sb.append(delta.asText());
        }
    }

    /**
     * Gọi LLM ở chế độ stream và phát từng token text (SSE).
     * Mỗi phần tử Flux là một token đã JSON-encode để frontend parse an toàn
     * (token có thể chứa xuống dòng, Spring SSE sẽ tách dòng nên phải encode).
     */
    public Flux<String> streamAsk(String message, List<ChatTurn> history, String language) {
        Map<String, Object> body = buildRequestBody(message, history, language, true);

        WebClient client = WebClient.builder()
                .baseUrl(chatCompletionsUrl())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.TEXT_EVENT_STREAM_VALUE)
                .build();

        WebClient.RequestBodySpec spec = client.post();
        if (apiKey != null && !apiKey.isBlank()) {
            spec.header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey);
        }

        return spec.bodyValue(body).retrieve()
                .bodyToFlux(new ParameterizedTypeReference<ServerSentEvent<String>>() {})
                .mapNotNull(sse -> {
                    String data = sse.data();
                    if (data == null) return null;
                    data = data.trim();
                    if (data.isEmpty() || "[DONE]".equals(data)) return null;
                    try {
                        StringBuilder sb = new StringBuilder();
                        appendChoiceContent(objectMapper.readTree(data), sb);
                        String token = sb.toString();
                        return token.isEmpty() ? null : toJsonString(token);
                    } catch (Exception e) {
                        log.debug("Skip unparsable SSE chunk: {}", e.getMessage());
                        return null;
                    }
                })
                .doOnError(e -> log.error("Advisor LLM stream failed (baseUrl={}): {}", baseUrl, e.getMessage()));
    }

    private String toJsonString(String token) {
        try {
            return objectMapper.writeValueAsString(token);
        } catch (Exception e) {
            return "\"\"";
        }
    }

    @Getter
    @Setter
    public static class ChatTurn {
        private String role;
        private String content;
    }

    public record AdvisorReply(String reply, String model) {}
}
