package com.quad.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

// An invitation, as the organizer sees it.
@Data
@AllArgsConstructor
public class InviteDto {
    @JsonProperty("username")
    private String username;
    @JsonProperty("name")
    private String name;
    // INVITED, JOINED, DECLINED or LEFT.
    @JsonProperty("status")
    private String status;
    @JsonProperty("createdDate")
    private LocalDateTime createdDate;
}
