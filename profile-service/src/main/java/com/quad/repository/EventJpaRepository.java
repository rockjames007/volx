package com.quad.repository;

import com.quad.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventJpaRepository extends JpaRepository<Event,Long> {

    // Active events that haven't finished yet (an event without an end date counts until it starts).
    @Query("select e from Event e where e.isActive = true "
            + "and (e.toDate > :now or (e.toDate is null and e.fromDate > :now))")
    Page<Event> findUpcoming(@Param("now") LocalDateTime now, Pageable pageable);

    @Query("select e from Event e where e.isActive = true and e.categoryId = :categoryId "
            + "and (e.toDate > :now or (e.toDate is null and e.fromDate > :now))")
    Page<Event> findUpcomingByCategory(@Param("categoryId") Long categoryId, @Param("now") LocalDateTime now,
                                       Pageable pageable);

    List<Event> findByCreatedByOrderByFromDateAsc(String createdBy);
}
