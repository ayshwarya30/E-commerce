package com.ecommerce.backend.shop.wishlist;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface WishlistItemRepository extends MongoRepository<WishlistItem, String> {
    List<WishlistItem> findBySessionIdOrderByProductIdAsc(String sessionId);

    Optional<WishlistItem> findBySessionIdAndProductId(String sessionId, Integer productId);

    void deleteBySessionIdAndProductId(String sessionId, Integer productId);
}
