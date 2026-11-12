package com.example.j2ee.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AdvisorChatServiceTest {

    @Test
    void systemPromptFor_english_returnsEnglishPrompt() {
        String prompt = AdvisorChatService.systemPromptFor("en");
        assertTrue(prompt.contains("always reply in English"));
        assertTrue(prompt.contains("JadT Airline"));
    }

    @Test
    void systemPromptFor_vietnamese_returnsVietnamesePrompt() {
        String prompt = AdvisorChatService.systemPromptFor("vi");
        assertTrue(prompt.contains("trả lời bằng tiếng Việt"));
    }

    @Test
    void systemPromptFor_nullOrUnknown_defaultsToVietnamese() {
        assertTrue(AdvisorChatService.systemPromptFor(null).contains("tiếng Việt"));
        assertTrue(AdvisorChatService.systemPromptFor("fr").contains("tiếng Việt"));
        assertTrue(AdvisorChatService.systemPromptFor("").contains("tiếng Việt"));
    }

    @Test
    void systemPromptFor_caseInsensitive() {
        assertTrue(AdvisorChatService.systemPromptFor("EN").contains("English"));
    }
}
