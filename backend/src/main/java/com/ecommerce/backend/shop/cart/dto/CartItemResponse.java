package com.ecommerce.backend.shop.cart.dto;

public record CartItemResponse(
        Integer id,
        String name,
        String category,
        String description,
        int price,
        double rating,
        int qty
) {
}
