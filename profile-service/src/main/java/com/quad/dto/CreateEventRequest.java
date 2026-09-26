package com.quad.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateEventRequest {

    @NotBlank
    @Size(max = 120)
    private String name;
    @Size(max = 2000)
    private String description;
    @NotNull
    private Long categoryId;
    @NotNull
    @Future
    private LocalDateTime fromDate;
    @NotNull
    private LocalDateTime toDate;
    @Min(1)
    private Integer noOfParticipant;
    @Valid
    private AddressDto address;
}
