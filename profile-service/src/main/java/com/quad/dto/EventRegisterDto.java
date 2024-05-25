package com.quad.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventRegisterDto {
    @JsonProperty("eventId")
    private Long eventId;
    @JsonProperty("userId")
    private Long volunteerId;
    @JsonProperty("userId")
    private Long categoryId;
    @JsonProperty("userId")
    private LocalDateTime createdDate;
}
