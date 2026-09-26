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
    // The volunteer's full name at sign-up, for the organizer's attendee list.
    private String volunteerName;
    private LocalDateTime createdDate;

    // Attendance, set by QR check-in or by the organizer. null = not recorded yet.
    private Boolean attended;
    // When the volunteer scanned the event's QR code (null if the organizer marked them present).
    private LocalDateTime checkedInAt;
    // Verified volunteering hours credited for this event.
    private Double hours;
    // Public code printed on the certificate so schools and employers can verify it.
    @Column(unique = true, length = 36)
    private String verificationCode;
}
