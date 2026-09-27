package com.quad.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * What a volunteer wants to help with, and whether organizers may find them and invite them to events.
 * Nobody is findable until they opt in (Singapore's PDPA: consent before others can see or contact you).
 */
@Entity
@Data
public class VolunteerPreference {
    @Id
    private String username;
    // The volunteer's name when they last saved, for organizers' search results.
    private String name;
    // Where they'd like to help, e.g. "Tampines".
    @Column(length = 60)
    private String area;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "volunteer_interest", joinColumns = @JoinColumn(name = "username"))
    @Column(name = "category_id")
    private Set<Long> interests = new HashSet<>();
    // When they're usually free, e.g. "SAT_MORNING" (see TimeSlots). Organizers only ever see totals.
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "volunteer_availability", joinColumns = @JoinColumn(name = "username"))
    @Column(name = "slot", length = 16)
    private Set<String> availability = new HashSet<>();
    // Opted in to being found and invited by organizers.
    private boolean discoverable;
    // Organizers (by username) this volunteer doesn't want invitations from.
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "volunteer_muted_organizer", joinColumns = @JoinColumn(name = "username"))
    @Column(name = "organizer")
    private Set<String> mutedOrganizers = new HashSet<>();
    private LocalDateTime updatedDate;
}
