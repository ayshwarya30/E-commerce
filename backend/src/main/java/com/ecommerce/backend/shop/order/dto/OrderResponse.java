package com.ecommerce.backend.shop.order.dto;

import java.time.Instant;
import java.util.List;

public record OrderResponse(
        String id,
        List<OrderItemResponse> items,
        int total,
        String paymentMethod,
        String status,
        Instant createdAt
) {
}
