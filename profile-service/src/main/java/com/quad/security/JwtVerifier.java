package com.quad.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.security.Key;

/**
 * Verifies tokens issued by the authentication service, which signs them with the same shared secret.
 */
@Component
public class JwtVerifier {

    private final Key signingKey;

    public JwtVerifier(@Value("${security.jwt.secret-key}") String secretKey) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
    }

    /**
     * @return the logged-in user; tokens issued before account types existed count as volunteers
     * @throws ResponseStatusException 401 if the header is missing or the token is invalid or expired
     */
    public Caller requireCaller(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Log in to continue");
        }
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(authorizationHeader.substring(7))
                    .getBody();
            String role = claims.get("role", String.class);
            return new Caller(claims.getSubject(), role == null ? "VOLUNTEER" : role,
                    claims.get("name", String.class), claims.get("org", String.class));
        } catch (JwtException | IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Your session has expired, please log in again");
        }
    }
}
