package com.quad.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class RankingDto {
    @JsonProperty("volunteerDtoList")
    private List<VolunteerDto> volunteerDtoList;
}
