package com.ecommerce.backend.shop.order.dto;

public record OrderItemResponse(
        Integer id,
        String name,
        int price,
        int qty
) {
}
