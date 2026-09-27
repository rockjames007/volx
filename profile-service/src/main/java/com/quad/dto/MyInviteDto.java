package com.quad.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

// An invitation, as the volunteer sees it.
@Data
@AllArgsConstructor
public class MyInviteDto {
    @JsonProperty("id")
    private Long id;
    @JsonProperty("event")
    private EventDto event;
    @JsonProperty("organizerName")
    private String organizerName;
    @JsonProperty("message")
    private String message;
    @JsonProperty("createdDate")
    private LocalDateTime createdDate;
}
