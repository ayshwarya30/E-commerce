package com.ecommerce.backend.shop.wishlist;

import com.ecommerce.backend.shop.product.Product;
import com.ecommerce.backend.shop.product.ProductService;
import com.ecommerce.backend.shop.wishlist.dto.AddWishlistItemRequest;
import com.ecommerce.backend.shop.wishlist.dto.WishlistItemResponse;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class WishlistService {
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductService productService;

    public WishlistService(WishlistItemRepository wishlistItemRepository, ProductService productService) {
        this.wishlistItemRepository = wishlistItemRepository;
        this.productService = productService;
    }

    public List<WishlistItemResponse> listItems(String sessionId) {
        return wishlistItemRepository.findBySessionIdOrderByProductIdAsc(requireSessionId(sessionId)).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public WishlistItemResponse addItem(AddWishlistItemRequest request) {
        String sessionId = requireSessionId(request.sessionId());
        Product product = productService.getById(request.productId());

        WishlistItem item = wishlistItemRepository.findBySessionIdAndProductId(sessionId, request.productId())
                .orElseGet(() -> new WishlistItem(
                        sessionId,
                        product.getId(),
                        product.getName(),
                        product.getCategory(),
                        product.getDescription(),
                        product.getPrice(),
                        product.getRating()
                ));

        return toResponse(wishlistItemRepository.save(item));
    }

    public void removeItem(String sessionId, Integer productId) {
        wishlistItemRepository.deleteBySessionIdAndProductId(requireSessionId(sessionId), productId);
    }

    private static String requireSessionId(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            throw new IllegalArgumentException("sessionId is required");
        }
        return sessionId.trim();
    }

    private WishlistItemResponse toResponse(WishlistItem item) {
        return new WishlistItemResponse(
                item.getProductId(),
                item.getName(),
                item.getCategory(),
                item.getDescription(),
                item.getPrice(),
                item.getRating()
        );
    }
}
