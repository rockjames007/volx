package com.quad.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ImageDto {
    @JsonProperty("id")
    private Long id;
    @JsonProperty("base64")
    private String base64;
}
