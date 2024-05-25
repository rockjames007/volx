package com.quad.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VolunteerDto {
    @JsonProperty("userId")
    private Long userId;
    @JsonProperty("email")
    private String email;
    @JsonProperty("gender")
    private String gender;
    @JsonProperty("phoneNumber")
    private String phoneNumber;
    @JsonProperty("profileImage")
    private ImageDto profileImage;
    @JsonProperty("address")
    private AddressDto address;
    @JsonProperty("points")
    private Integer points;
    @JsonProperty("createdDate")
    private LocalDateTime createdDate;
}
