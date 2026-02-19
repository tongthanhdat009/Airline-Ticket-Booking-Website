package com.example.j2ee.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestClientCustomizer; // Import this
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class OpenRouterConfig {

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder()
                .defaultHeader("HTTP-Referer", frontendUrl)
                .defaultHeader("X-Title", "chat bot máy bay");
    }

    @Bean
    public RestClientCustomizer restClientCustomizer() {
        return restClientBuilder -> restClientBuilder
                .defaultHeader("HTTP-Referer", frontendUrl)
                .defaultHeader("X-Title", "chat bot máy bay");
    }

    @Bean
    public ChatClient chatClient(@Autowired(required = false) ChatModel chatModel) {
        if (chatModel == null) {
            throw new IllegalStateException(
                "ChatModel bean không được khởi tạo. " +
                "Vui lòng kiểm tra: \n" +
                "1. spring.ai.openai.api-key có hợp lệ không\n" +
                "2. spring.ai.openai.base-url đúng format (không có /v1 ở cuối)\n" +
                "3. Dependency spring-ai-starter-model-openai đã được thêm vào pom.xml"
            );
        }
        return ChatClient.builder(chatModel).build();
    }
}