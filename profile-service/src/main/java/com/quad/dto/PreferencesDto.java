package com.quad.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

// A volunteer's causes, area and invitation settings.
@Data
@AllArgsConstructor
public class PreferencesDto {
    @JsonProperty("interests")
    private List<String> interests;
    @JsonProperty("area")
    private String area;
    @JsonProperty("discoverable")
    private boolean discoverable;
    @JsonProperty("mutedOrganizers")
    private List<MutedOrganizerDto> mutedOrganizers;

    @Data
    @AllArgsConstructor
    public static class MutedOrganizerDto {
        @JsonProperty("username")
        private String username;
        @JsonProperty("name")
        private String name;
    }
}
