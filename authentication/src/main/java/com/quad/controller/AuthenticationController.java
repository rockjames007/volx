package com.quad.controller;

import com.quad.dto.AuthenticationRequest;
import com.quad.dto.AuthenticationResponse;
import com.quad.dto.RegisterRequest;
import com.quad.entity.Role;
import com.quad.entity.User;
import com.quad.repository.UserRepository;
import com.quad.service.CustomUserDetailsService;
import com.quad.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/authorize")
    public Mono<AuthenticationResponse> createAuthenticationTokens(@RequestBody AuthenticationRequest authenticationRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authenticationRequest.getUsername(),
                            authenticationRequest.getPassword())
            );
        } catch (AuthenticationException e) {
            return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));
        }

        final UserDetails userDetails = customUserDetailsService.loadUserByUsername(authenticationRequest.getUsername());
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return Mono.just(tokenFor(user, userDetails));
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<AuthenticationResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return Mono.error(new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken"));
        }
        if (userRepository.existsByEmailIgnoreCase(registerRequest.getEmail())) {
            return Mono.error(new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered"));
        }

        Role role = registerRequest.getRole() == null ? Role.VOLUNTEER : registerRequest.getRole();
        String organizationName = trimToNull(registerRequest.getOrganizationName());
        if (role == Role.ORGANIZER && organizationName == null) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organizers need an organization name"));
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFullName(registerRequest.getFullName().trim());
        user.setRole(role);
        user.setOrganizationName(role == Role.ORGANIZER ? organizationName : null);
        userRepository.save(user);

        return Mono.just(tokenFor(user, customUserDetailsService.loadUserByUsername(user.getUsername())));
    }

    // Other services read these claims instead of calling back here.
    private AuthenticationResponse tokenFor(User user, UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        if (user.getFullName() != null) {
            claims.put("name", user.getFullName());
        }
        if (user.getOrganizationName() != null) {
            claims.put("org", user.getOrganizationName());
        }
        return new AuthenticationResponse(jwtService.generateToken(claims, userDetails), user.getUsername(),
                jwtService.getExpirationTime(), user.getRole(), user.getFullName(), user.getOrganizationName());
    }

    private static String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
