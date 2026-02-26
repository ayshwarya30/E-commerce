package com.ecommerce.backend.shop.order.dto;

import jakarta.validation.constraints.NotBlank;

public record PlaceOrderRequest(
        @NotBlank(message = "sessionId is required") String sessionId,
        @NotBlank(message = "paymentMethod is required") String paymentMethod
) {
}
