package com.quad.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

/**
 * When to hold an event: for each weekly time slot, how many matching volunteers are usually free and how many
 * have actually turned up at that time before. Totals only, never who.
 */
@Data
@AllArgsConstructor
public class PlanningDto {
    // Opted-in volunteers matching the cause and area.
    @JsonProperty("matchingVolunteers")
    private int matchingVolunteers;
    // How many of them have said when they're free.
    @JsonProperty("withAvailability")
    private int withAvailability;
    @JsonProperty("slots")
    private List<SlotDto> slots;

    @Data
    @AllArgsConstructor
    public static class SlotDto {
        @JsonProperty("slot")
        private String slot;
        // Matching volunteers usually free then.
        @JsonProperty("available")
        private int available;
        // Verified attendances at events in this cause starting in this slot (all organizers).
        @JsonProperty("turnout")
        private int turnout;
        // Verified attendances at your own events starting in this slot.
        @JsonProperty("yourTurnout")
        private int yourTurnout;
    }
}
