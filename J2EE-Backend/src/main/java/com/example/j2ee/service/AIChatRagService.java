package com.example.j2ee.service;

import com.example.j2ee.model.AISuggestionLog;
import com.example.j2ee.model.ChatMessage;
import com.example.j2ee.repository.AISuggestionLogRepository;
import com.example.j2ee.repository.ChatMessageRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIChatRagService {

    private final ChatClient chatClient;
    private final ChatMessageRepository messageRepository;
    private final AISuggestionLogRepository logRepository;
    private final ObjectMapper objectMapper;

    @Value("${ai.suggestion.max-context-messages:5}")
    private int maxContextMessages;

    @Value("${spring.ai.openai.chat.options.model:stepfun/step-3.5-flash:free}")
    private String modelName;

    private static final String SYSTEM_PROMPT = """
            Bạn là nhân viên hỗ trợ khách hàng của hệ thống đặt vé máy bay.
            
            PHẠM VI CHỈ ĐƯỢC TRẢ LỜI:
            1. Đặt vé, đổi vé, hủy vé, hoàn tiền
            2. Hành lý, chỗ ngồi, suất ăn
            3. Check-in, lịch bay, delay/cancel
            4. Thanh toán, hóa đơn, khuyến mãi
            5. Đăng ký tài khoản, đăng nhập
            6. Hỗ trợ kỹ thuật website/app
            
            CẤM:
            - Tư vấn ngoài phạm vi hàng không
            - Chính trị, tôn giáo, y tế
            - Nội dung không liên quan
            
            NGUYÊN TẮC:
            - Trả lời ngắn gọn: 1-2 câu, max 150 ký tự mỗi gợi ý
            - Giọng điệu lịch sự, chuyên nghiệp
            - Không hứa hẹn ngoài quy định
            - Nếu thiếu thông tin → hỏi lại
            
            BẮT BUỘC OUTPUT ĐÚNG JSON FORMAT (không thêm bất kỳ text nào khác):
            {"suggestions":["Câu 1","Câu 2","Câu 3"]}
            """;

    /**
     * Tạo gợi ý trả lời cho admin dựa trên lịch sử chat.
     * Chỉ xử lý khi tin nhắn cuối từ customer.
     *
     * @param sessionId ID phiên chat
     * @param adminId   ID admin yêu cầu gợi ý
     * @return AISuggestionResponse chứa danh sách gợi ý
     */
    @Transactional
    public AISuggestionResponse generateSuggestions(String sessionId, Integer adminId) {
        long startTime = System.currentTimeMillis();

        // 1. Lấy toàn bộ messages trong session
        List<ChatMessage> messages = messageRepository
                .findByChatSession_SessionIdOrderByNgayGuiAsc(sessionId);

        // 2. Kiểm tra: Chỉ xử lý nếu tin nhắn cuối là từ customer
        if (messages.isEmpty()) {
            return AISuggestionResponse.empty();
        }

        ChatMessage lastMessage = messages.get(messages.size() - 1);
        if (!"customer".equals(lastMessage.getNguoiGui())) {
            log.debug("Skip AI suggestion: Last message not from customer");
            return AISuggestionResponse.empty();
        }

        // 3. Build RAG context
        String context = buildRagContext(messages);

        // 4. Gọi AI
        try {
            String aiResponse = chatClient.prompt()
                    .system(SYSTEM_PROMPT)
                    .user("""
                            LỊCH SỬ CHAT:
                            %s
                            
                            Dựa vào cuộc trò chuyện trên, đề xuất 3 câu trả lời phù hợp cho nhân viên hỗ trợ.
                            Trả về đúng JSON format: {"suggestions":["Câu 1","Câu 2","Câu 3"]}
                            """.formatted(context))
                    .call()
                    .content();

            long processingTime = System.currentTimeMillis() - startTime;

            // 5. Parse JSON response
            log.info("AI raw response: {}", aiResponse);
            List<String> suggestions = parseAISuggestions(aiResponse);
            log.info("Parsed suggestions: {}", suggestions);

            // 6. Log kết quả
            logSuggestion(sessionId, adminId, messages.size(), (int) processingTime);

            log.info("AI suggestion generated for session {} in {}ms", sessionId, processingTime);

            return new AISuggestionResponse(
                    suggestions,
                    processingTime,
                    modelName
            );

        } catch (Exception e) {
            log.error("AI suggestion failed for session {}: {}", sessionId, e.getMessage());
            return AISuggestionResponse.fallback();
        }
    }

    /**
     * Build RAG context từ lịch sử chat
     */
    private String buildRagContext(List<ChatMessage> messages) {
        StringBuilder sb = new StringBuilder();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:mm");

        int start = Math.max(0, messages.size() - maxContextMessages);

        for (int i = start; i < messages.size(); i++) {
            ChatMessage msg = messages.get(i);
            String sender = switch (msg.getNguoiGui()) {
                case "customer" -> "KHÁCH HÀNG";
                case "admin" -> "NHÂN VIÊN" +
                        (msg.getAdmin() != null ? "(" + msg.getAdmin().getHoVaTen() + ")" : "");
                default -> "HỆ THỐNG";
            };
            sb.append(String.format("[%s] %s: %s\n",
                    msg.getNgayGui().format(fmt), sender, msg.getNoiDung()));
        }

        return sb.toString();
    }

    /**
     * Parse JSON response từ AI thành danh sách suggestions
     */
    private List<String> parseAISuggestions(String aiResponse) {
        try {
            // Tìm JSON trong response (AI có thể trả về text kèm JSON)
            String json = extractJson(aiResponse);
            JsonNode root = objectMapper.readTree(json);
            JsonNode suggestionsNode = root.get("suggestions");

            if (suggestionsNode != null && suggestionsNode.isArray()) {
                return objectMapper.convertValue(suggestionsNode,
                        new TypeReference<List<String>>() {});
            }
        } catch (Exception e) {
            log.warn("Failed to parse AI suggestion JSON: {}", e.getMessage());
        }

        // Fallback: trả về response gốc nếu không parse được JSON
        return List.of(aiResponse.trim());
    }

    /**
     * Trích xuất JSON từ response text (xử lý trường hợp AI trả kèm text)
     */
    private String extractJson(String text) {
        if (text == null) return "{}";

        // Tìm JSON object trong text
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');

        if (start >= 0 && end > start) {
            return text.substring(start, end + 1);
        }

        return text;
    }

    /**
     * Lưu log gợi ý AI
     */
    private void logSuggestion(String sessionId, Integer adminId, int messageCount, int processingTime) {
        try {
            AISuggestionLog logEntry = new AISuggestionLog();
            logEntry.setSessionId(sessionId);
            logEntry.setMaAdmin(adminId);
            logEntry.setSoTinNhan(messageCount);
            logEntry.setThoiGianMs(processingTime);
            logRepository.save(logEntry);
        } catch (Exception e) {
            log.warn("Failed to save AI suggestion log: {}", e.getMessage());
        }
    }

    /**
     * DTO chứa kết quả gợi ý từ AI
     */
    public record AISuggestionResponse(
            List<String> suggestions,
            long processingTimeMs,
            String model
    ) {
        public static AISuggestionResponse empty() {
            return new AISuggestionResponse(List.of(), 0, "none");
        }

        public static AISuggestionResponse fallback() {
            return new AISuggestionResponse(
                    List.of("Xin lỗi, tôi không thể đề xuất lúc này. Vui lòng thử lại sau."),
                    0, "fallback"
            );
        }
    }
}
