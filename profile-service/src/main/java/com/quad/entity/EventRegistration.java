package com.quad.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * A volunteer signing up for an event.
 */
@Entity
@Data
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "username"}))
public class EventRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "event_id")
    private Event event;
    @Column(nullable = false)
    private String username;
    private LocalDateTime createdDate;
}
