package com.quad.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

// One row of an organizer's attendee list.
@Data
@AllArgsConstructor
public class VolunteerSignupDto {
    @JsonProperty("username")
    private String username;
    @JsonProperty("name")
    private String name;
    @JsonProperty("joinedAt")
    private LocalDateTime joinedAt;
    @JsonProperty("attended")
    private Boolean attended;
    @JsonProperty("checkedInAt")
    private LocalDateTime checkedInAt;
    @JsonProperty("hours")
    private Double hours;
}
