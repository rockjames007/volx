package com.quad.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class PreferencesRequest {
    @NotNull
    private List<Long> interests;
    @Size(max = 60)
    private String area;
    // Weekly time slots, e.g. "SAT_MORNING"; unknown ones are ignored. Optional, so older clients keep working.
    private List<String> availability;
    private boolean discoverable;
    // Organizers to keep muted; leaving one out unmutes them.
    private List<String> mutedOrganizers;
}
