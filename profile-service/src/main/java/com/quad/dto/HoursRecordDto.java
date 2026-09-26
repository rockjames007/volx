package com.quad.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class HoursRecordDto {
    @JsonProperty("totalHours")
    private Double totalHours;
    @JsonProperty("entries")
    private List<HoursEntryDto> entries;
}
