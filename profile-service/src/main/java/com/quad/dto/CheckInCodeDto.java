package com.quad.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

// What the organizer's attendance screen needs to show the check-in QR code.
@Data
@AllArgsConstructor
public class CheckInCodeDto {
    @JsonProperty("code")
    private String code;
    @JsonProperty("opensAt")
    private LocalDateTime opensAt;
    @JsonProperty("closesAt")
    private LocalDateTime closesAt;
}
