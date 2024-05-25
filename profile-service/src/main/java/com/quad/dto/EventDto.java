package com.quad.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventDto {
    @JsonProperty("id")
    private Long id;
    @JsonProperty("name")
    private String name;
    @JsonProperty("description")
    private String description;
    @JsonProperty("category")
    private CategoryDto category;
    @JsonProperty("address")
    private AddressDto address;
    @JsonProperty("bgImage")
    private ImageDto bgImage;
    @JsonProperty("fromDate")
    private LocalDateTime fromDate;
    @JsonProperty("toDate")
    private LocalDateTime toDate;
    @JsonProperty("isActive")
    private Boolean isActive;
    @JsonProperty("noOfParticipant")
    private Integer noOfParticipant;
    @JsonProperty("createdDate")
    private LocalDateTime createdDate;
}
