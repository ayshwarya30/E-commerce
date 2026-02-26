package com.ecommerce.backend.shop.wishlist.dto;

public record WishlistItemResponse(
        Integer id,
        String name,
        String category,
        String description,
        int price,
        double rating
) {
}
