package com.ecommerce.backend.shop.wishlist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddWishlistItemRequest(
        @NotBlank(message = "sessionId is required") String sessionId,
        @NotNull(message = "productId is required") Integer productId
) {
}
