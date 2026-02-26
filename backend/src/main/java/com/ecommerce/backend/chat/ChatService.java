package com.ecommerce.backend.chat;

import com.ecommerce.backend.shop.product.Product;
import com.ecommerce.backend.shop.product.ProductService;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ChatService {
    private static final Set<String> ECOMMERCE_KEYWORDS = Set.of(
            "product", "products", "buy", "shopping", "shop", "price", "budget", "cart", "wishlist",
            "order", "delivery", "shipping", "payment", "upi", "card", "checkout", "discount",
            "electronics", "fashion", "home", "beauty", "books", "sports", "recommend", "track"
    );

    private final GeminiClient geminiClient;
    private final ProductService productService;

    public ChatService(GeminiClient geminiClient, ProductService productService) {
        this.geminiClient = geminiClient;
        this.productService = productService;
    }

    public String replyTo(String message) {
        String normalized = message == null ? "" : message.toLowerCase(Locale.ROOT);
        if (!isEcommerceQuestion(normalized)) {
            return "I can only help with this e-commerce app: products, prices, budget, cart, wishlist, payments, orders, and delivery tracking.";
        }

        List<Product> recommendedProducts = productService.recommendProducts(message, 5);
        String productContext = recommendedProducts.stream()
                .map(product -> "- " + product.getName() + " | Category: " + product.getCategory() + " | Price: Rs " + product.getPrice())
                .collect(Collectors.joining("\n"));

        String prompt = """
                You are the in-app assistant for an e-commerce project.
                Strict rule: answer only e-commerce topics for this app.
                If user asks non e-commerce topics, politely refuse and redirect to shopping help.
                Always prefer concise practical answers.
                If user asks for recommendations, include products from AVAILABLE_PRODUCTS.

                AVAILABLE_PRODUCTS:
                %s

                USER_MESSAGE:
                %s
                """.formatted(productContext, message);

        return geminiClient.generateReply(prompt);
    }

    private boolean isEcommerceQuestion(String normalizedMessage) {
        if (normalizedMessage.isBlank()) {
            return false;
        }

        return ECOMMERCE_KEYWORDS.stream().anyMatch(normalizedMessage::contains);
    }
}
