package com.quad.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

/**
 * A volunteer in an organizer's search results. Deliberately no contact details: invitations go through JoinTeer.
 */
@Data
@AllArgsConstructor
public class VolunteerMatchDto {
    @JsonProperty("username")
    private String username;
    // First name and last initial, e.g. "Priya N."
    @JsonProperty("name")
    private String name;
    @JsonProperty("area")
    private String area;
    @JsonProperty("interests")
    private List<String> interests;
    @JsonProperty("verifiedHours")
    private double verifiedHours;
    @JsonProperty("eventsAttended")
    private int eventsAttended;
    // Verified events in the cause being searched for.
    @JsonProperty("causeEvents")
    private int causeEvents;
    // Verified events with the searching organizer.
    @JsonProperty("eventsWithYou")
    private int eventsWithYou;
    // For the event being filled: JOINED, INVITED, DECLINED, LEFT, or null if not asked yet.
    @JsonProperty("status")
    private String status;
}
