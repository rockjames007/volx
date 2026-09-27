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
    private boolean discoverable;
    // Organizers to keep muted; leaving one out unmutes them.
    private List<String> mutedOrganizers;
}
