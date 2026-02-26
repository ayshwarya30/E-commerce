package com.ecommerce.backend.chat;

import com.ecommerce.backend.chat.dto.GeminiGenerateContentRequest;
import com.ecommerce.backend.chat.dto.GeminiGenerateContentResponse;
import com.ecommerce.backend.config.GeminiProperties;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class GeminiClient {
    private final RestClient restClient;
    private final GeminiProperties geminiProperties;

    public GeminiClient(RestClient geminiRestClient, GeminiProperties geminiProperties) {
        this.restClient = geminiRestClient;
        this.geminiProperties = geminiProperties;
    }

    public String generateReply(String userMessage) {
        if (geminiProperties.getApiKey() == null || geminiProperties.getApiKey().isBlank()) {
            throw new IllegalStateException("Gemini API key is missing. Set GEMINI_API_KEY.");
        }

        GeminiGenerateContentRequest body = GeminiGenerateContentRequest.fromUserMessage(userMessage);

        GeminiGenerateContentResponse response;
        try {
            response = restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1beta/models/{model}:generateContent")
                            .queryParam("key", geminiProperties.getApiKey())
                            .build(geminiProperties.getModel()))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(GeminiGenerateContentResponse.class);
        } catch (RestClientException ex) {
            throw new RuntimeException("Failed to call Gemini API.", ex);
        }

        if (response == null) {
            throw new RuntimeException("Gemini API returned an empty response.");
        }

        return response.firstText()
                .orElseThrow(() -> new RuntimeException("Gemini API returned no text response."));
    }
}
