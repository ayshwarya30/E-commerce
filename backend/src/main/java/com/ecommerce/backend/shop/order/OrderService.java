package com.ecommerce.backend.shop.order;

import com.ecommerce.backend.shop.cart.CartItem;
import com.ecommerce.backend.shop.cart.CartService;
import com.ecommerce.backend.shop.order.dto.OrderItemResponse;
import com.ecommerce.backend.shop.order.dto.OrderResponse;
import com.ecommerce.backend.shop.order.dto.OrderTrackResponse;
import com.ecommerce.backend.shop.order.dto.PlaceOrderRequest;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final CartService cartService;

    public OrderService(OrderRepository orderRepository, CartService cartService) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
    }

    public OrderResponse placeOrder(PlaceOrderRequest request) {
        String sessionId = requireSessionId(request.sessionId());
        String paymentMethod = requirePaymentMethod(request.paymentMethod());

        List<CartItem> cartItems = cartService.getSessionItems(sessionId);
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty.");
        }

        List<Order.LineItem> orderItems = cartItems.stream()
                .map(item -> new Order.LineItem(item.getProductId(), item.getName(), item.getPrice(), item.getQty()))
                .collect(Collectors.toList());

        int total = cartItems.stream()
                .mapToInt(item -> item.getPrice() * item.getQty())
                .sum();

        String orderId = "ORD" + String.valueOf(System.currentTimeMillis()).substring(6);
        Order order = new Order(
                orderId,
                sessionId,
                orderItems,
                total,
                paymentMethod,
                "Order Confirmed",
                Instant.now()
        );

        Order savedOrder = orderRepository.save(order);
        cartService.clearSessionItems(sessionId);
        return toResponse(savedOrder);
    }

    public List<OrderResponse> listOrders(String sessionId) {
        return orderRepository.findBySessionIdOrderByCreatedAtDesc(requireSessionId(sessionId)).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public OrderTrackResponse trackOrder(String sessionId, String orderId) {
        String normalizedSessionId = requireSessionId(sessionId);
        if (orderId == null || orderId.isBlank()) {
            throw new IllegalArgumentException("orderId is required");
        }
        String normalizedOrderId = orderId.trim().toUpperCase(Locale.ROOT);

        return orderRepository.findByIdAndSessionId(normalizedOrderId, normalizedSessionId)
                .map(order -> new OrderTrackResponse(
                        order.getId(),
                        order.getStatus(),
                        "Order " + order.getId() + ": " + order.getStatus() + " and currently in transit."
                ))
                .orElseGet(() -> new OrderTrackResponse(
                        normalizedOrderId,
                        "NOT_FOUND",
                        "Order not found. Please check order ID from your recent orders."
                ));
    }

    private static String requireSessionId(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            throw new IllegalArgumentException("sessionId is required");
        }
        return sessionId.trim();
    }

    private static String requirePaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            throw new IllegalArgumentException("paymentMethod is required");
        }
        return paymentMethod.trim();
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> new OrderItemResponse(item.getId(), item.getName(), item.getPrice(), item.getQty()))
                .collect(Collectors.toList());

        return new OrderResponse(
                order.getId(),
                items,
                order.getTotal(),
                order.getPaymentMethod(),
                order.getStatus(),
                order.getCreatedAt()
        );
    }
}
