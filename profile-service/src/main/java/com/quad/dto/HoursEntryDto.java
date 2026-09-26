package com.quad.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

// One verified event in a volunteer's record; also what the public certificate page shows.
@Data
@AllArgsConstructor
public class HoursEntryDto {
    @JsonProperty("eventId")
    private Long eventId;
    @JsonProperty("eventName")
    private String eventName;
    @JsonProperty("organizerName")
    private String organizerName;
    @JsonProperty("category")
    private String category;
    @JsonProperty("place")
    private String place;
    @JsonProperty("fromDate")
    private LocalDateTime fromDate;
    @JsonProperty("toDate")
    private LocalDateTime toDate;
    @JsonProperty("volunteerName")
    private String volunteerName;
    @JsonProperty("hours")
    private Double hours;
    @JsonProperty("verificationCode")
    private String verificationCode;
}
