package com.example.j2ee.controller;

import com.example.j2ee.annotation.RequirePermission;
import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.service.AIChatRagService;
import com.example.j2ee.service.AIChatRagService.AISuggestionResponse;
import com.example.j2ee.util.SecurityUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller cho tính năng AI gợi ý trả lời chat.
 * Sử dụng RAG với lịch sử chat để đề xuất câu trả lời cho admin.
 */
@RestController
@RequestMapping("/ai-chat")
@RequiredArgsConstructor
public class AIChatController {

    private final AIChatRagService aiService;

    /**
     * Tạo gợi ý trả lời từ AI dựa trên lịch sử chat.
     * Chỉ tạo gợi ý khi tin nhắn cuối là từ khách hàng.
     *
     * @param request chứa sessionId của phiên chat
     * @return danh sách 3 gợi ý trả lời
     */
    @PostMapping("/suggest")
    // @RequirePermission(feature = "SUPPORT", action = "VIEW") // Tạm bỏ để test
    public ResponseEntity<ApiResponse<AISuggestionResponse>> suggest(
            @Valid @RequestBody AISuggestRequest request) {

        Integer adminId = SecurityUtil.getCurrentAdminId();
        if (adminId == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Không có quyền truy cập"));
        }

        AISuggestionResponse response = aiService.generateSuggestions(
                request.sessionId(), adminId);

        return ResponseEntity.ok(ApiResponse.success(
                response.suggestions().isEmpty() ? "Không có gợi ý" : "Đã tạo gợi ý",
                response));
    }

    /**
     * DTO yêu cầu gợi ý AI
     */
    public record AISuggestRequest(
            @NotBlank(message = "Session ID không được để trống")
            String sessionId
    ) {}
}
