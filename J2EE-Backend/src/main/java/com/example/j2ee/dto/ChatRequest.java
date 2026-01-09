package com.example.j2ee.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    private String message;
    private Double temperature;  // Optional: 0.0 - 1.0
    private Integer maxTokens;   // Optional: max tokens in response
}
