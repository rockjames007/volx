package com.quad.dto;

import lombok.Data;

@Data
public class DeclineInviteRequest {
    // Also stop invitations from this organizer.
    private boolean muteOrganizer;
}
