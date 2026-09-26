package com.quad.dto;

import com.quad.entity.Role;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class AuthenticationResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = -9126274639063345775L;

    private final String jwt;
    private final String username;
    private final long expiresIn;
    private final Role role;
    private final String fullName;
    private final String organizationName;

}
