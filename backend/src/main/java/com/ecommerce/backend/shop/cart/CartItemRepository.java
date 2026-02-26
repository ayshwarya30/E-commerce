package com.ecommerce.backend.shop.cart;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CartItemRepository extends MongoRepository<CartItem, String> {
    List<CartItem> findBySessionIdOrderByProductIdAsc(String sessionId);

    Optional<CartItem> findBySessionIdAndProductId(String sessionId, Integer productId);

    void deleteBySessionIdAndProductId(String sessionId, Integer productId);

    long deleteBySessionId(String sessionId);
}
