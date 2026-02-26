package com.ecommerce.backend.shop.product;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> listProducts(String search, String category) {
        String normalizedSearch = normalize(search);
        String normalizedCategory = normalize(category);

        return productRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .filter(product -> matchesCategory(product, normalizedCategory))
                .filter(product -> matchesSearch(product, normalizedSearch))
                .collect(Collectors.toList());
    }

    public Product getById(Integer id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
    }

    public List<Product> recommendProducts(String userMessage, int limit) {
        int safeLimit = Math.max(1, limit);
        List<Product> matched = listProducts(userMessage, "All");
        if (!matched.isEmpty()) {
            return matched.stream()
                    .limit(safeLimit)
                    .collect(Collectors.toList());
        }

        return productRepository.findAll().stream()
                .sorted(Comparator.comparingInt(Product::getPrice))
                .limit(safeLimit)
                .collect(Collectors.toList());
    }

    private static boolean matchesCategory(Product product, String category) {
        if (category.isBlank() || "all".equals(category)) {
            return true;
        }
        return product.getCategory() != null && product.getCategory().toLowerCase(Locale.ROOT).equals(category);
    }

    private static boolean matchesSearch(Product product, String search) {
        if (search.isBlank()) {
            return true;
        }

        String name = product.getName() == null ? "" : product.getName().toLowerCase(Locale.ROOT);
        String description = product.getDescription() == null ? "" : product.getDescription().toLowerCase(Locale.ROOT);
        return name.contains(search) || description.contains(search);
    }

    private static String normalize(String input) {
        return input == null ? "" : input.trim().toLowerCase(Locale.ROOT);
    }
}
