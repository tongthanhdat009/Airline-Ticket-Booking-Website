package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.service.AdvisorChatService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;

/**
 * Controller khung chat tư vấn LLM cho khách hàng (không cần đăng nhập).
 * Backend proxy tới gateway 9router chuẩn OpenAI-compatible,
 * API key giữ ở phía server, không lộ ra frontend.
 */
@RestController
@RequestMapping("/advisor")
@RequiredArgsConstructor
public class AdvisorChatController {

    private final AdvisorChatService advisorChatService;

    /**
     * Khách gửi tin nhắn, nhận câu trả lời tư vấn từ LLM.
     */
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AdvisorChatResponse>> chat(
            @Valid @RequestBody AdvisorChatRequest request) {
        AdvisorChatService.AdvisorReply reply = advisorChatService.ask(
                request.getMessage(), request.getHistory());
        return ResponseEntity.ok(ApiResponse.success(
                "Tư vấn thành công",
                new AdvisorChatResponse(reply.reply(), reply.model())));
    }

    /**
     * Stream từng token trả lời (SSE). Mỗi event là một token đã JSON-encode.
     */
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chatStream(@Valid @RequestBody AdvisorChatRequest request) {
        return advisorChatService.streamAsk(request.getMessage(), request.getHistory());
    }

    @Getter
    @Setter
    public static class AdvisorChatRequest {
        @NotBlank(message = "Tin nhắn không được để trống")
        @Size(max = 2000, message = "Tin nhắn tối đa 2000 ký tự")
        private String message;

        @Size(max = 20, message = "Lịch sử tối đa 20 turns")
        private List<AdvisorChatService.ChatTurn> history;
    }

    public record AdvisorChatResponse(String reply, String model) {}
}
