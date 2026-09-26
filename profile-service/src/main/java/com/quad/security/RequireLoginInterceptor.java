package com.quad.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Rejects unauthenticated write requests before the request body is bound and validated,
 * and exposes the caller's username to controllers as a request attribute.
 */
@Component
public class RequireLoginInterceptor implements HandlerInterceptor {

    public static final String USERNAME_ATTRIBUTE = "volx.username";

    private final JwtVerifier jwtVerifier;

    public RequireLoginInterceptor(JwtVerifier jwtVerifier) {
        this.jwtVerifier = jwtVerifier;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("GET".equals(request.getMethod()) || "OPTIONS".equals(request.getMethod())
                || request.getAttribute(USERNAME_ATTRIBUTE) != null) {
            return true;
        }
        request.setAttribute(USERNAME_ATTRIBUTE, jwtVerifier.requireUsername(request.getHeader(HttpHeaders.AUTHORIZATION)));
        return true;
    }
}
