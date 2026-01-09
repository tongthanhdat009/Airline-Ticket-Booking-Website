package com.example.j2ee.service;

import com.example.j2ee.dto.ChatRequest;
import com.example.j2ee.dto.ChatResponse;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AIService {

    private static final Logger log = LoggerFactory.getLogger(AIService.class);

    private final ChatModel chatModel;
    private final FlightDataService flightDataService;
    
    @Value("${spring.ai.openai.chat.options.model:google/gemini-2.0-flash-exp:free}")
    private String modelName;

    public AIService(ChatModel chatModel, FlightDataService flightDataService) {
        this.chatModel = chatModel;
        this.flightDataService = flightDataService;
        
        // Log để kiểm tra ChatModel có được inject không
        if (chatModel == null) {
            log.error("❌ ChatModel is NULL! Spring AI không thể khởi tạo ChatModel bean.");
            log.error("Kiểm tra: spring.ai.openai.api-key và spring.ai.openai.base-url trong application.properties");
        } else {
            log.info("✅ ChatModel đã được khởi tạo thành công: {}", chatModel.getClass().getSimpleName());
            log.info("✅ Model name: {}", modelName);
        }
    }

    /**
     * Gửi message đến Polaris model và nhận response
     * @param request ChatRequest chứa message và các tùy chọn
     * @return ChatResponse chứa response từ AI
     */
    public ChatResponse chat(ChatRequest request) {
        try {
            // Kiểm tra chatModel
            if (chatModel == null) {
                log.error("ChatModel is NULL - Spring AI không khởi tạo được bean");
                throw new RuntimeException("ChatModel chưa được khởi tạo. Kiểm tra cấu hình Spring AI trong application.properties");
            }
            
            log.info("🤖 Đang xử lý chat request với model: {}", modelName);
            log.info("📝 User message: {}", request.getMessage());
            
            // Phân tích intent của user để chọn dữ liệu phù hợp
            String userMessage = request.getMessage().toLowerCase();
            String flightData = "";
            
            // Xác định loại truy vấn và lấy dữ liệu tương ứng
            if (userMessage.contains("tìm") || userMessage.contains("tìm kiếm") || userMessage.contains("chuyến bay")) {
                // Thử parse điểm đi, điểm đến từ message
                flightData = analyzeAndFetchFlightData(request.getMessage());
            } else if (userMessage.contains("giá") || userMessage.contains("bao nhiêu") || userMessage.contains("chi phí")) {
                flightData = analyzeAndFetchPriceData(request.getMessage());
            } else if (userMessage.contains("lịch") || userMessage.contains("ngày nào") || userMessage.contains("khi nào")) {
                flightData = analyzeAndFetchScheduleData(request.getMessage());
            } else if (userMessage.contains("tư vấn") || userMessage.contains("gợi ý") || userMessage.contains("nên")) {
                flightData = analyzeAndFetchRecommendations(request.getMessage());
            } else if (userMessage.contains("sân bay") || userMessage.contains("bay từ") || userMessage.contains("địa điểm")) {
                flightData = flightDataService.getAllAirports();
            } else {
                // Mặc định lấy danh sách chuyến bay sắp tới
                flightData = flightDataService.getUpcomingFlights();
            }
            
            // Tạo system prompt với dữ liệu chuyến bay
            String systemPrompt = """
                Bạn là trợ lý ảo chuyên nghiệp của SGU Airline, hãng hàng không hàng đầu Việt Nam.
                
                🎯 VAI TRÒ VÀ NHIỆM VỤ:
                - Bạn chỉ trả lời các câu hỏi liên quan đến chuyến bay, đặt vé, giá vé, lịch bay, và dịch vụ của SGU Airline
                - Bạn có quyền truy cập vào cơ sở dữ liệu chuyến bay THỰC TẾ và cung cấp thông tin CHÍNH XÁC
                - Bạn giúp khách hàng tìm kiếm và tư vấn chọn chuyến bay phù hợp nhất
                - Bạn có thể tra cứu: chuyến bay, giá vé, lịch bay, sân bay, và tư vấn lựa chọn tối ưu
                
                📋 NGUYÊN TẮC TRẢ LỜI:
                1. ❌ KHÔNG trả lời các câu hỏi không liên quan đến hàng không, chuyến bay, hoặc SGU Airline
                2. 🙏 Nếu được hỏi về chủ đề khác, lịch sự từ chối và hướng dẫn khách hàng quay lại vấn đề chuyến bay
                3. 😊 Luôn nhiệt tình, chuyên nghiệp và thân thiện
                4. ✅ Cung cấp thông tin chính xác dựa trên dữ liệu có sẵn
                5. 💡 Gợi ý khách hàng các chuyến bay phù hợp khi cần
                6. 📊 Sử dụng emoji phù hợp để câu trả lời sinh động và dễ đọc
                7. 🎯 Trả lời ngắn gọn, súc tích nhưng đầy đủ thông tin
                
                📊 DỮ LIỆU CHUYẾN BAY HIỆN TẠI:
                """ + flightData + """
                
                💬 HƯỚNG DẪN TRẢ LỜI:
                - Sử dụng dữ liệu trên để trả lời câu hỏi của khách hàng một cách chính xác
                - Nếu khách hỏi về chuyến bay, hãy giới thiệu các chuyến bay phù hợp từ danh sách
                - Nếu không tìm thấy kết quả phù hợp, hãy gợi ý các lựa chọn thay thế
                - Format câu trả lời dễ đọc với emoji và cấu trúc rõ ràng
                - Luôn kết thúc bằng câu hỏi "Bạn cần thêm thông tin gì về chuyến bay không?"
                """;
            
            // Kết hợp system prompt với user message
            String fullMessage = systemPrompt + "\n\n👤 Khách hàng hỏi: " + request.getMessage();
            
            // Tạo prompt đơn giản
            Prompt prompt = new Prompt(fullMessage);

            // Gọi AI model
            log.info("📤 Gửi request tới AI model...");
            org.springframework.ai.chat.model.ChatResponse aiResponse = chatModel.call(prompt);
            log.info("📥 Nhận được response từ AI model");

            // Lấy response text
            String responseText = aiResponse.getResult().getOutput().getText();

            // Lấy metadata
            String modelUsed = aiResponse.getMetadata().getModel();
            Integer tokensUsed = aiResponse.getMetadata().getUsage() != null 
                    ? aiResponse.getMetadata().getUsage().getTotalTokens().intValue()
                    : 0;

            return new ChatResponse(
                    responseText,
                    modelUsed,
                    tokensUsed
            );

        } catch (Exception e) {
            log.error("❌ Lỗi khi gọi AI model: {}", e.getMessage(), e);
            
            // Xây dựng error message chi tiết
            String errorDetails = e.getMessage();
            if (e.getCause() != null) {
                errorDetails += " | Cause: " + e.getCause().getMessage();
            }
            
            throw new RuntimeException("Lỗi khi gọi AI model: " + errorDetails, e);
        }
    }

    /**
     * Chat đơn giản chỉ với message
     * @param message Message từ user
     * @return Response từ AI
     */
    public String simpleChat(String message) {
        ChatRequest request = new ChatRequest(message, null, null);
        return chat(request).getResponse();
    }

    /**
     * Streaming chat (cho real-time response)
     */
    public String streamChat(String message) {
        // Lấy dữ liệu chuyến bay
        String flightData = flightDataService.getUpcomingFlights();
        
        String systemPrompt = """
            Bạn là trợ lý ảo của SGU Airline. Chỉ trả lời về chuyến bay và dịch vụ hàng không.
            
            """ + flightData + """
            
            Khách hàng hỏi: """ + message;
            
        Prompt prompt = new Prompt(systemPrompt);
        StringBuilder fullResponse = new StringBuilder();
        
        chatModel.stream(prompt)
                .doOnNext(chunk -> {
                    String content = chunk.getResult().getOutput().getText();
                    fullResponse.append(content);
                })
                .blockLast();
        
        return fullResponse.toString();
    }

    /**
     * Phân tích và lấy dữ liệu chuyến bay dựa trên message
     */
    private String analyzeAndFetchFlightData(String message) {
        String lowerMessage = message.toLowerCase();
        
        // Danh sách các thành phố và mã sân bay
        String[] cities = {"hồ chí minh", "hcm", "sài gòn", "saigon", "sgn", 
                          "hà nội", "hanoi", "han", "nội bài",
                          "đà nẵng", "da nang", "danang", "dad"};
        
        String diemDi = null;
        String diemDen = null;
        java.time.LocalDate ngayDi = parseDateFromMessage(message);
        
        // Tìm điểm đi
        for (String city : cities) {
            if (lowerMessage.contains("từ " + city) || lowerMessage.contains("khởi hành từ " + city)) {
                diemDi = city;
                break;
            }
        }
        
        // Tìm điểm đến
        for (String city : cities) {
            if (lowerMessage.contains("đến " + city) || lowerMessage.contains("tới " + city) || 
                lowerMessage.contains("đi " + city)) {
                diemDen = city;
                break;
            }
        }
        
        log.info("🔍 Phân tích: điểm đi={}, điểm đến={}, ngày={}", diemDi, diemDen, ngayDi);
        
        // Nếu tìm thấy cả điểm đi và điểm đến
        if (diemDi != null && diemDen != null) {
            return flightDataService.searchFlights(diemDi, diemDen, ngayDi);
        }
        
        // Nếu chỉ có ngày, tìm tất cả chuyến bay trong ngày đó
        if (ngayDi != null) {
            return flightDataService.searchFlights("", "", ngayDi);
        }
        
        return flightDataService.getUpcomingFlights();
    }

    /**
     * Parse ngày tháng từ message của user
     * Hỗ trợ format: dd/MM/yyyy, dd-MM-yyyy, "ngày dd tháng MM", "25/12", v.v.
     */
    private java.time.LocalDate parseDateFromMessage(String message) {
        try {
            String lowerMessage = message.toLowerCase();
            
            // Pattern 1: dd/MM/yyyy (25/12/2025)
            java.util.regex.Pattern pattern1 = java.util.regex.Pattern.compile("(\\d{1,2})/(\\d{1,2})/(\\d{4})");
            java.util.regex.Matcher matcher1 = pattern1.matcher(message);
            if (matcher1.find()) {
                int day = Integer.parseInt(matcher1.group(1));
                int month = Integer.parseInt(matcher1.group(2));
                int year = Integer.parseInt(matcher1.group(3));
                return java.time.LocalDate.of(year, month, day);
            }
            
            // Pattern 2: dd-MM-yyyy (25-12-2025)
            java.util.regex.Pattern pattern2 = java.util.regex.Pattern.compile("(\\d{1,2})-(\\d{1,2})-(\\d{4})");
            java.util.regex.Matcher matcher2 = pattern2.matcher(message);
            if (matcher2.find()) {
                int day = Integer.parseInt(matcher2.group(1));
                int month = Integer.parseInt(matcher2.group(2));
                int year = Integer.parseInt(matcher2.group(3));
                return java.time.LocalDate.of(year, month, day);
            }
            
            // Pattern 3: dd/MM (25/12) - tự động thêm năm hiện tại
            java.util.regex.Pattern pattern3 = java.util.regex.Pattern.compile("(\\d{1,2})/(\\d{1,2})(?![/\\d])");
            java.util.regex.Matcher matcher3 = pattern3.matcher(message);
            if (matcher3.find()) {
                int day = Integer.parseInt(matcher3.group(1));
                int month = Integer.parseInt(matcher3.group(2));
                int year = java.time.LocalDate.now().getYear();
                return java.time.LocalDate.of(year, month, day);
            }
            
            // Pattern 4: "ngày dd tháng MM" (ngày 25 tháng 12)
            java.util.regex.Pattern pattern4 = java.util.regex.Pattern.compile("ngày\\s+(\\d{1,2})\\s+tháng\\s+(\\d{1,2})");
            java.util.regex.Matcher matcher4 = pattern4.matcher(lowerMessage);
            if (matcher4.find()) {
                int day = Integer.parseInt(matcher4.group(1));
                int month = Integer.parseInt(matcher4.group(2));
                int year = java.time.LocalDate.now().getYear();
                return java.time.LocalDate.of(year, month, day);
            }
            
            // Pattern 5: "yyyy-MM-dd" (2025-12-25)
            java.util.regex.Pattern pattern5 = java.util.regex.Pattern.compile("(\\d{4})-(\\d{1,2})-(\\d{1,2})");
            java.util.regex.Matcher matcher5 = pattern5.matcher(message);
            if (matcher5.find()) {
                int year = Integer.parseInt(matcher5.group(1));
                int month = Integer.parseInt(matcher5.group(2));
                int day = Integer.parseInt(matcher5.group(3));
                return java.time.LocalDate.of(year, month, day);
            }
            
            log.info("⚠️ Không parse được ngày từ message: {}", message);
            
        } catch (Exception e) {
            log.warn("❌ Lỗi khi parse ngày từ message: {}", e.getMessage());
        }
        
        return null;
    }

    /**
     * Phân tích và lấy dữ liệu giá vé
     */
    private String analyzeAndFetchPriceData(String message) {
        String lowerMessage = message.toLowerCase();
        
        String[] cities = {"hồ chí minh", "hcm", "sài gòn", "sgn", 
                          "hà nội", "hanoi", "han",
                          "đà nẵng", "da nang", "dad"};
        
        String diemDi = null;
        String diemDen = null;
        
        for (String city : cities) {
            if (lowerMessage.contains(city)) {
                if (diemDi == null) {
                    diemDi = city;
                } else {
                    diemDen = city;
                    break;
                }
            }
        }
        
        if (diemDi != null && diemDen != null) {
            return flightDataService.getPricesByRoute(diemDi, diemDen);
        }
        
        return flightDataService.getUpcomingFlights();
    }

    /**
     * Phân tích và lấy lịch bay
     */
    private String analyzeAndFetchScheduleData(String message) {
        String lowerMessage = message.toLowerCase();
        
        String[] cities = {"hồ chí minh", "hcm", "sài gòn", "sgn", 
                          "hà nội", "hanoi", "han",
                          "đà nẵng", "da nang", "dad"};
        
        String diemDi = null;
        String diemDen = null;
        
        for (String city : cities) {
            if (lowerMessage.contains(city)) {
                if (diemDi == null) {
                    diemDi = city;
                } else {
                    diemDen = city;
                    break;
                }
            }
        }
        
        // Lấy lịch trong 7 ngày tới
        java.time.LocalDate tuNgay = java.time.LocalDate.now();
        java.time.LocalDate denNgay = tuNgay.plusDays(7);
        
        return flightDataService.getFlightSchedule(diemDi, diemDen, tuNgay, denNgay);
    }

    /**
     * Phân tích và lấy gợi ý chuyến bay
     */
    private String analyzeAndFetchRecommendations(String message) {
        String lowerMessage = message.toLowerCase();
        
        String[] cities = {"hồ chí minh", "hcm", "sài gòn", "sgn", 
                          "hà nội", "hanoi", "han",
                          "đà nẵng", "da nang", "dad"};
        
        String diemDi = null;
        String diemDen = null;
        String hangVe = null;
        
        for (String city : cities) {
            if (lowerMessage.contains(city)) {
                if (diemDi == null) {
                    diemDi = city;
                } else {
                    diemDen = city;
                    break;
                }
            }
        }
        
        // Xác định hạng vé
        if (lowerMessage.contains("economy") || lowerMessage.contains("phổ thông")) {
            hangVe = "Economy";
        } else if (lowerMessage.contains("business") || lowerMessage.contains("thương gia")) {
            hangVe = "Business";
        } else if (lowerMessage.contains("deluxe")) {
            hangVe = "Deluxe";
        } else if (lowerMessage.contains("first class") || lowerMessage.contains("hạng nhất")) {
            hangVe = "First Class";
        }
        
        if (diemDi != null && diemDen != null) {
            return flightDataService.recommendFlights(diemDi, diemDen, null, hangVe);
        }
        
        return flightDataService.getUpcomingFlights();
    }
}
