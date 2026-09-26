package com.quad.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.List;

/**
 * Rejects unauthenticated write requests (and reads of private data) before the request body is bound and
 * validated, and exposes the caller to controllers as a request attribute.
 */
@Component
public class RequireLoginInterceptor implements HandlerInterceptor {

    public static final String CALLER_ATTRIBUTE = "volx.caller";

    // Reads that are only for the logged-in user: their own events and hours, and an organizer's attendee
    // list and check-in code.
    private static final List<String> PRIVATE_READS = List.of("/profile/me/**", "/profile/events/*/volunteers",
            "/profile/events/*/check-in-code");
    private static final AntPathMatcher PATHS = new AntPathMatcher();

    private final JwtVerifier jwtVerifier;

    public RequireLoginInterceptor(JwtVerifier jwtVerifier) {
        this.jwtVerifier = jwtVerifier;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        boolean read = "GET".equals(request.getMethod()) || "OPTIONS".equals(request.getMethod());
        boolean publicRead = read && PRIVATE_READS.stream().noneMatch(p -> PATHS.match(p, request.getRequestURI()));
        if (publicRead || request.getAttribute(CALLER_ATTRIBUTE) != null) {
            return true;
        }
        request.setAttribute(CALLER_ATTRIBUTE, jwtVerifier.requireCaller(request.getHeader(HttpHeaders.AUTHORIZATION)));
        return true;
    }
}
