package com.quad.service.impl;

import com.quad.dto.PlanningDto;
import com.quad.entity.Event;
import com.quad.entity.EventRegistration;
import com.quad.entity.VolunteerPreference;
import com.quad.repository.EventRegistrationJpaRepository;
import com.quad.repository.VolunteerPreferenceRepository;
import com.quad.security.Caller;
import com.quad.service.PlanningService;
import com.quad.service.TimeSlots;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PlanningServiceImpl implements PlanningService {

    private final VolunteerPreferenceRepository preferences;
    private final EventRegistrationJpaRepository registrations;

    public PlanningServiceImpl(VolunteerPreferenceRepository preferences, EventRegistrationJpaRepository registrations) {
        this.preferences = preferences;
        this.registrations = registrations;
    }

    @Override
    public PlanningDto bestTimes(Long categoryId, String area, Caller organizer) {
        if (!organizer.isOrganizer()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only organizer accounts can plan events");
        }
        String wantedArea = area == null || area.isBlank() ? null : area.trim().toLowerCase();

        // Availability of opted-in volunteers who care about this cause and are in this area. Only people who
        // chose to be found count, and only totals leave this method.
        List<VolunteerPreference> matching = preferences.findByDiscoverableTrue().stream()
                .filter(p -> !p.getMutedOrganizers().contains(organizer.username()))
                .filter(p -> categoryId == null || p.getInterests().contains(categoryId))
                .filter(p -> wantedArea == null || (p.getArea() != null && p.getArea().toLowerCase().contains(wantedArea)))
                .toList();
        Map<String, Integer> available = new HashMap<>();
        matching.forEach(p -> p.getAvailability().forEach(slot -> available.merge(slot, 1, Integer::sum)));

        // When people have actually turned up: verified attendance by the event's start time.
        Map<String, Integer> turnout = new HashMap<>();
        Map<String, Integer> yourTurnout = new HashMap<>();
        for (EventRegistration registration : registrations.findByAttendedTrue()) {
            Event event = registration.getEvent();
            if (event.getFromDate() == null) {
                continue;
            }
            String slot = TimeSlots.of(event.getFromDate());
            if (categoryId == null || categoryId.equals(event.getCategoryId())) {
                turnout.merge(slot, 1, Integer::sum);
            }
            if (organizer.username().equals(event.getCreatedBy())) {
                yourTurnout.merge(slot, 1, Integer::sum);
            }
        }

        List<PlanningDto.SlotDto> slots = TimeSlots.ALL.stream()
                .map(slot -> new PlanningDto.SlotDto(slot, available.getOrDefault(slot, 0),
                        turnout.getOrDefault(slot, 0), yourTurnout.getOrDefault(slot, 0)))
                .toList();
        int withAvailability = (int) matching.stream().filter(p -> !p.getAvailability().isEmpty()).count();
        return new PlanningDto(matching.size(), withAvailability, slots);
    }
}
