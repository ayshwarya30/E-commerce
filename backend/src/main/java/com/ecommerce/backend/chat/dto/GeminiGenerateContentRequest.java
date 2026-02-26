package com.ecommerce.backend.chat.dto;

import java.util.List;

public record GeminiGenerateContentRequest(List<Content> contents) {

    public static GeminiGenerateContentRequest fromUserMessage(String message) {
        return new GeminiGenerateContentRequest(
                List.of(new Content(List.of(new Part(message))))
        );
    }

    public record Content(List<Part> parts) {
    }

    public record Part(String text) {
    }
}
