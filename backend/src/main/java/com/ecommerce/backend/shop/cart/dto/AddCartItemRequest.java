package com.ecommerce.backend.shop.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddCartItemRequest(
        @NotBlank(message = "sessionId is required") String sessionId,
        @NotNull(message = "productId is required") Integer productId,
        @NotNull(message = "qty is required") @Min(value = 1, message = "qty must be at least 1") Integer qty
) {
}
