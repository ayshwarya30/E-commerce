package com.ecommerce.backend.chat.dto;

import java.util.List;
import java.util.Optional;

public record GeminiGenerateContentResponse(List<Candidate> candidates) {

    public Optional<String> firstText() {
        if (candidates == null) {
            return Optional.empty();
        }

        return candidates.stream()
                .filter(candidate -> candidate != null && candidate.content() != null && candidate.content().parts() != null)
                .flatMap(candidate -> candidate.content().parts().stream())
                .map(Part::text)
                .filter(text -> text != null && !text.isBlank())
                .findFirst();
    }

    public record Candidate(Content content) {
    }

    public record Content(List<Part> parts) {
    }

    public record Part(String text) {
    }
}
