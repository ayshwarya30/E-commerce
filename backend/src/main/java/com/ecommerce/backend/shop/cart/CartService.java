package com.ecommerce.backend.shop.cart;

import com.ecommerce.backend.shop.cart.dto.AddCartItemRequest;
import com.ecommerce.backend.shop.cart.dto.CartItemResponse;
import com.ecommerce.backend.shop.product.Product;
import com.ecommerce.backend.shop.product.ProductService;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class CartService {
    private final CartItemRepository cartItemRepository;
    private final ProductService productService;

    public CartService(CartItemRepository cartItemRepository, ProductService productService) {
        this.cartItemRepository = cartItemRepository;
        this.productService = productService;
    }

    public List<CartItemResponse> listItems(String sessionId) {
        String normalizedSessionId = requireSessionId(sessionId);
        return cartItemRepository.findBySessionIdOrderByProductIdAsc(normalizedSessionId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CartItemResponse addItem(AddCartItemRequest request) {
        String sessionId = requireSessionId(request.sessionId());
        Integer productId = request.productId();
        Integer qtyToAdd = request.qty();

        Product product = productService.getById(productId);
        CartItem item = cartItemRepository.findBySessionIdAndProductId(sessionId, productId)
                .orElseGet(() -> new CartItem(
                        sessionId,
                        product.getId(),
                        product.getName(),
                        product.getCategory(),
                        product.getDescription(),
                        product.getPrice(),
                        product.getRating(),
                        0
                ));

        item.setQty(item.getQty() + qtyToAdd);
        return toResponse(cartItemRepository.save(item));
    }

    public void removeItem(String sessionId, Integer productId) {
        cartItemRepository.deleteBySessionIdAndProductId(requireSessionId(sessionId), productId);
    }

    public List<CartItem> getSessionItems(String sessionId) {
        return cartItemRepository.findBySessionIdOrderByProductIdAsc(requireSessionId(sessionId));
    }

    public void clearSessionItems(String sessionId) {
        cartItemRepository.deleteBySessionId(requireSessionId(sessionId));
    }

    private static String requireSessionId(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            throw new IllegalArgumentException("sessionId is required");
        }
        return sessionId.trim();
    }

    private CartItemResponse toResponse(CartItem item) {
        return new CartItemResponse(
                item.getProductId(),
                item.getName(),
                item.getCategory(),
                item.getDescription(),
                item.getPrice(),
                item.getRating(),
                item.getQty()
        );
    }
}
