package com.quad.security;

/**
 * The logged-in user making a request, as stated by their token from the authentication service.
 * fullName and organizationName may be null for tokens issued before account types existed.
 */
public record Caller(String username, String role, String fullName, String organizationName) {

    public static final String ORGANIZER = "ORGANIZER";

    public boolean isOrganizer() {
        return ORGANIZER.equals(role);
    }

    // What others see: the organization for organizers, otherwise the person's name.
    public String displayName() {
        if (isOrganizer() && organizationName != null) {
            return organizationName;
        }
        return fullName != null ? fullName : username;
    }
}
