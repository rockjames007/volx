package com.quad.repository;

import com.quad.entity.EventInvite;
import com.quad.entity.InviteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventInviteRepository extends JpaRepository<EventInvite, Long> {
    long countByEventId(Long eventId);
    List<EventInvite> findByEventIdOrderByCreatedDateDesc(Long eventId);
    Optional<EventInvite> findByEventIdAndUsername(Long eventId, String username);
    List<EventInvite> findByUsernameAndStatusOrderByCreatedDateDesc(String username, InviteStatus status);
}
