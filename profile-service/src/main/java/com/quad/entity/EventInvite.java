package com.quad.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * An organizer asking a volunteer to come to one of their events. At most one per volunteer per event.
 */
@Entity
@Data
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "username"}))
public class EventInvite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "event_id")
    private Event event;
    @Column(nullable = false)
    private String username;
    private String volunteerName;
    private String invitedBy;
    // A short personal note from the organizer.
    @Column(length = 500)
    private String message;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InviteStatus status;
    private LocalDateTime createdDate;
    private LocalDateTime respondedDate;
}
