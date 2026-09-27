package com.quad.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class InviteRequest {
    @NotEmpty
    @Size(max = 50)
    private List<String> usernames;
    @Size(max = 500)
    private String message;
}
