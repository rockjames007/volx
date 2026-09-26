package com.quad.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

// The organizer marking a volunteer present or absent, optionally adjusting their hours.
@Data
public class AttendanceUpdateRequest {
    @NotNull
    private Boolean attended;
    @DecimalMin("0.5")
    @DecimalMax("24")
    private Double hours;
}
