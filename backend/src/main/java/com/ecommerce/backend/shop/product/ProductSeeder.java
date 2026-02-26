package com.ecommerce.backend.shop.product;

import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ProductSeeder implements CommandLineRunner {
    private static final List<String> CATEGORIES = List.of("Electronics", "Fashion", "Home", "Beauty", "Books", "Sports");
    private final ProductRepository productRepository;

    public ProductSeeder(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            return;
        }

        List<Product> products = new ArrayList<>();
        for (int index = 0; index < 520; index++) {
            int id = index + 1;
            String category = CATEGORIES.get(index % CATEGORIES.size());
            int price = 299 + (id % 18) * 175 + (id / 8) * 12;
            double rating = Math.round((3 + (id % 3) + (id % 10) / 20.0) * 10.0) / 10.0;

            products.add(new Product(
                    id,
                    category + " Product " + id,
                    category,
                    "Premium " + category.toLowerCase() + " item designed for daily use and value shopping.",
                    price,
                    rating
            ));
        }

        productRepository.saveAll(products);
    }
}
