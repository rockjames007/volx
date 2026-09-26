package com.quad.config;

import com.quad.entity.Category;
import com.quad.repository.CategoryJpaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Gives a fresh database a starter set of event categories so organizers can create events straight away.
 */
@Component
public class CategorySeeder implements CommandLineRunner {

    private static final List<String[]> DEFAULT_CATEGORIES = List.of(
            new String[]{"Environment", "Clean-ups, tree planting and conservation"},
            new String[]{"Education", "Tutoring, mentoring and literacy"},
            new String[]{"Health", "Blood drives, health camps and wellbeing"},
            new String[]{"Community", "Neighbourhood support and local events"},
            new String[]{"Animals", "Shelters, rescue and animal welfare"},
            new String[]{"Disaster relief", "Emergency response and relief supplies"}
    );

    private final CategoryJpaRepository categoryJpaRepository;

    public CategorySeeder(CategoryJpaRepository categoryJpaRepository) {
        this.categoryJpaRepository = categoryJpaRepository;
    }

    @Override
    public void run(String... args) {
        if (categoryJpaRepository.count() > 0) {
            return;
        }
        for (String[] entry : DEFAULT_CATEGORIES) {
            Category category = new Category();
            category.setCategory(entry[0]);
            category.setCategoryDescription(entry[1]);
            category.setCreatedDate(LocalDateTime.now());
            categoryJpaRepository.save(category);
        }
    }
}
