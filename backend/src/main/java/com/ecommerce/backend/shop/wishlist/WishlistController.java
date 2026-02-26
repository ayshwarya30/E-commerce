package com.ecommerce.backend.shop.wishlist;

import com.ecommerce.backend.shop.wishlist.dto.AddWishlistItemRequest;
import com.ecommerce.backend.shop.wishlist.dto.WishlistItemResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {
    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public List<WishlistItemResponse> listItems(@RequestParam String sessionId) {
        return wishlistService.listItems(sessionId);
    }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public WishlistItemResponse addItem(@Valid @RequestBody AddWishlistItemRequest request) {
        return wishlistService.addItem(request);
    }

    @DeleteMapping("/items/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeItem(@RequestParam String sessionId, @PathVariable Integer productId) {
        wishlistService.removeItem(sessionId, productId);
    }
}
