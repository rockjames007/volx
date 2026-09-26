package com.quad.repository;

import com.quad.entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationJpaRepository extends JpaRepository<EventRegistration, Long> {

    long countByEventId(Long eventId);

    boolean existsByEventIdAndUsername(Long eventId, String username);

    Optional<EventRegistration> findByEventIdAndUsername(Long eventId, String username);

    List<EventRegistration> findByUsernameOrderByEventFromDateAsc(String username);
}
