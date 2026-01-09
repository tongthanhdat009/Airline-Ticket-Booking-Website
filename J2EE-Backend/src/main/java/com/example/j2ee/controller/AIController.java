package com.example.j2ee.controller;

import com.example.j2ee.dto.ChatRequest;
import com.example.j2ee.dto.ChatResponse;
import com.example.j2ee.service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    /**
     * Endpoint để chat với Polaris AI model
     * POST /api/ai/chat
     * Body: {"message": "Your message here", "temperature": 0.7, "maxTokens": 4096}
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        try {
            ChatResponse response = aiService.chat(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ChatResponse errorResponse = new ChatResponse();
            errorResponse.setResponse("Lỗi: " + e.getMessage());
            errorResponse.setModel("error");
            errorResponse.setTokensUsed(0);
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Endpoint đơn giản để chat với Polaris AI model
     * GET /api/ai/chat?message=Your message here
     */
    @GetMapping("/chat")
    public ResponseEntity<String> simpleChat(@RequestParam String message) {
        try {
            String response = aiService.simpleChat(message);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Lỗi: " + e.getMessage());
        }
    }

    /**
     * Health check endpoint
     * GET /api/ai/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("AI Service is running with Polaris model on OpenRouter");
    }

    /**
     * Endpoint để test streaming chat
     * GET /api/ai/stream?message=Your message here
     */
    @GetMapping("/stream")
    public ResponseEntity<String> streamChat(@RequestParam String message) {
        try {
            String response = aiService.streamChat(message);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Lỗi: " + e.getMessage());
        }
    }
}
