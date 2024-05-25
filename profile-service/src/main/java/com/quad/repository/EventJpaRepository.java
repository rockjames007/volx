package com.quad.repository;

import com.quad.entity.Event;
import com.quad.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventJpaRepository extends JpaRepository<Event,Long> {

    Page<Event> findByIsActiveTrue(Pageable pageable);

    Page<Event> findByIsActiveTrueAndCategoryId(Pageable pageable, Long categoryId);
}
