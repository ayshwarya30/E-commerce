package com.ecommerce.backend.shop.order;

import com.ecommerce.backend.shop.order.dto.OrderResponse;
import com.ecommerce.backend.shop.order.dto.OrderTrackResponse;
import com.ecommerce.backend.shop.order.dto.PlaceOrderRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse placeOrder(@Valid @RequestBody PlaceOrderRequest request) {
        return orderService.placeOrder(request);
    }

    @GetMapping
    public List<OrderResponse> listOrders(@RequestParam String sessionId) {
        return orderService.listOrders(sessionId);
    }

    @GetMapping("/track/{orderId}")
    public OrderTrackResponse trackOrder(@PathVariable String orderId, @RequestParam String sessionId) {
        return orderService.trackOrder(sessionId, orderId);
    }
}
