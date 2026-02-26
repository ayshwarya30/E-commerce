package com.ecommerce.backend.shop.order;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findBySessionIdOrderByCreatedAtDesc(String sessionId);

    Optional<Order> findByIdAndSessionId(String id, String sessionId);
}
