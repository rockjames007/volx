package com.quad.repository;

import com.quad.entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationJpaRepository extends JpaRepository<EventRegistration, Long> {

    long countByEventId(Long eventId);
    boolean existsByUsername(String username);

    boolean existsByEventIdAndUsername(Long eventId, String username);

    Optional<EventRegistration> findByEventIdAndUsername(Long eventId, String username);

    List<EventRegistration> findByUsernameOrderByEventFromDateAsc(String username);

    List<EventRegistration> findByEventIdOrderByCreatedDateAsc(Long eventId);

    List<EventRegistration> findByUsernameAndAttendedTrueOrderByEventFromDateDesc(String username);

    Optional<EventRegistration> findByVerificationCode(String verificationCode);
    List<EventRegistration> findByAttendedTrueAndUsernameIn(Collection<String> usernames);
    List<EventRegistration> findByAttendedTrue();
}
