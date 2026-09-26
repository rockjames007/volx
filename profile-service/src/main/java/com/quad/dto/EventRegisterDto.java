package com.quad.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventRegisterDto {
    @JsonProperty("eventId")
    private Long eventId;
    @JsonProperty("volunteerId")
    private Long volunteerId;
    @JsonProperty("categoryId")
    private Long categoryId;
    @JsonProperty("createdDate")
    private LocalDateTime createdDate;
}
