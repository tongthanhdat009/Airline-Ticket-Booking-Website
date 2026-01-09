package com.example.j2ee.controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/ai")
public class GroqAiController {

    private final ChatClient chatClient;

    // Spring AI recommends injecting the Builder and building a default client
    public GroqAiController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    // Simple sample endpoint to send a prompt to Groq (OpenAI-compatible) and get a reply
    @PostMapping("/chat")
    public Map<String, Object> chat(@RequestBody Map<String, String> body) {
        String prompt = body == null ? null : body.get("prompt");
        if (prompt == null || prompt.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing 'prompt' in request body");
        }

        String reply = chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();

        Map<String, Object> resp = new HashMap<>();
        resp.put("prompt", prompt);
        resp.put("reply", reply);
        return resp;
    }

    // New endpoint: ground answers on schema.sql and data.sql to return correct flights
    @PostMapping("/flight")
    public Map<String, Object> groundedFlightQA(@RequestBody Map<String, String> body) {
        String question = body == null ? null : body.get("question");
        if (question == null || question.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing 'question' in request body");
        }

        String schema = safeReadClasspathText("schema.sql");
        String data = safeReadClasspathText("data.sql");

        if ((schema == null || schema.isBlank()) && (data == null || data.isBlank())) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not load schema.sql or data.sql from classpath");
        }

        String system = "You are a precise SQL-grounded assistant for a flight booking system. " +
                "Use ONLY the provided SQL schema and data to answer questions. " +
                "If the answer cannot be derived from the given data, say you don't know. " +
                "When asked to find flights, identify and return the exact matching records from the data, " +
                "including key fields like flight id, route, date/time, and price if available. Return concise results.";

        // To reduce token usage, cap very large files
        String cappedSchema = cap(schema, 120_000); // ~120k chars
        String cappedData = cap(data, 180_000);     // ~180k chars

        String reply = chatClient
                .prompt()
                .system(system)
                .user("Here is the database schema (SQL DDL):\n\n" + cappedSchema + "\n\n" +
                        "Here is the initial data (SQL INSERTs):\n\n" + cappedData + "\n\n" +
                        "User question: " + question + "\n\n" +
                        "Answer strictly from the given schema and data. If multiple flights match, list them.")
                .call()
                .content();

        Map<String, Object> resp = new HashMap<>();
        resp.put("question", question);
        resp.put("reply", reply);
        return resp;
    }

    private String safeReadClasspathText(String path) {
        try {
            ClassPathResource resource = new ClassPathResource(path);
            if (!resource.exists()) return null;
            String text = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
            return text;
        } catch (IOException e) {
            return null;
        }
    }

    private String cap(String s, int maxChars) {
        if (s == null) return null;
        if (s.length() <= maxChars) return s;
        return s.substring(0, maxChars) + "\n-- [Truncated for context length]";
    }

    // Quick health-check/info endpoint
    @GetMapping("/info")
    public Map<String, Object> info() {
        Map<String, Object> info = new HashMap<>();
        info.put("provider", "groq (OpenAI-compatible)");
        info.put("baseUrl", "${spring.ai.openai.base-url}");
        info.put("modelProperty", "spring.ai.openai.chat.options.model");
        return info;
    }
}
