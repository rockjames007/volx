package com.quad.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InviteResultDto {
    @JsonProperty("invited")
    private int invited;
    // Already asked, already going, not accepting invitations, or over the event's limit.
    @JsonProperty("skipped")
    private int skipped;
    // How many more invitations this event can send.
    @JsonProperty("remaining")
    private int remaining;
}
