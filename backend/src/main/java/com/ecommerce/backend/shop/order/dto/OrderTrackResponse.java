package com.ecommerce.backend.shop.order.dto;

public record OrderTrackResponse(
        String orderId,
        String status,
        String message
) {
}
