package com.quad.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class MyEventsDto {
    @JsonProperty("joined")
    private List<EventDto> joined;
    @JsonProperty("organizing")
    private List<EventDto> organizing;
}
