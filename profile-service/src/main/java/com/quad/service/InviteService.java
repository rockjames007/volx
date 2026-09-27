package com.quad.service;

import com.quad.dto.EventDto;
import com.quad.dto.InviteDto;
import com.quad.dto.InviteRequest;
import com.quad.dto.InviteResultDto;
import com.quad.dto.MyInviteDto;
import com.quad.dto.PreferencesDto;
import com.quad.dto.PreferencesRequest;
import com.quad.dto.VolunteerMatchDto;
import com.quad.security.Caller;

import java.util.List;

// Volunteers' preferences, organizers finding volunteers, and invitations to events.
public interface InviteService {
    PreferencesDto getPreferences(Caller volunteer);

    PreferencesDto savePreferences(PreferencesRequest request, Caller volunteer);

    List<VolunteerMatchDto> findVolunteers(Long eventId, Long categoryId, String area, boolean experiencedOnly,
                                           Caller organizer);

    InviteResultDto invite(String eventId, InviteRequest request, Caller organizer);

    List<InviteDto> getInvites(String eventId, Caller organizer);

    List<MyInviteDto> getMyInvites(Caller volunteer);

    EventDto accept(Long inviteId, Caller volunteer);

    void decline(Long inviteId, boolean muteOrganizer, Caller volunteer);
}
