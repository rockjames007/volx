package com.quad.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class AuthenticationResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = -9126274639063345775L;

    private final String jwt;

}
