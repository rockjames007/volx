package com.quad.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CheckInResultDto {
    @JsonProperty("eventId")
    private Long eventId;
    @JsonProperty("eventName")
    private String eventName;
    @JsonProperty("hours")
    private Double hours;
    @JsonProperty("verificationCode")
    private String verificationCode;
    // True when the volunteer had already checked in (scanning twice is harmless).
    @JsonProperty("alreadyCheckedIn")
    private boolean alreadyCheckedIn;
}
