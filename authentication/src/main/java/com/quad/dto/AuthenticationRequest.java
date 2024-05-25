package com.quad.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class AuthenticationRequest {

    @JsonProperty("username")
    private String username;
    @JsonProperty("password")
    private String password;

}
