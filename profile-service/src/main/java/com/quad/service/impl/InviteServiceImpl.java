package com.quad.service.impl;

import com.quad.dto.EventDto;
import com.quad.dto.InviteDto;
import com.quad.dto.InviteRequest;
import com.quad.dto.InviteResultDto;
import com.quad.dto.MyInviteDto;
import com.quad.dto.PreferencesDto;
import com.quad.dto.PreferencesRequest;
import com.quad.dto.VolunteerMatchDto;
import com.quad.entity.Category;
import com.quad.entity.Event;
import com.quad.entity.EventInvite;
import com.quad.entity.EventRegistration;
import com.quad.entity.InviteStatus;
import com.quad.entity.VolunteerPreference;
import com.quad.repository.CategoryJpaRepository;
import com.quad.repository.EventInviteRepository;
import com.quad.repository.EventJpaRepository;
import com.quad.repository.EventRegistrationJpaRepository;
import com.quad.repository.VolunteerPreferenceRepository;
import com.quad.security.Caller;
import com.quad.service.EventService;
import com.quad.service.InviteService;
import com.quad.service.TimeSlots;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class InviteServiceImpl implements InviteService {

    // Invitations per event: three per open spot (at least 10), or 50 when the event has no limit. Enough to fill
    // an event without organizers messaging everyone.
    static final int INVITES_PER_SPOT = 3;
    static final int MIN_INVITES = 10;
    static final int INVITES_WITHOUT_LIMIT = 50;
    private static final int MAX_RESULTS = 100;

    private final VolunteerPreferenceRepository preferences;
    private final EventInviteRepository invites;
    private final EventJpaRepository events;
    private final EventRegistrationJpaRepository registrations;
    private final CategoryJpaRepository categories;
    private final EventService eventService;
    private final ModelMapper modelMapper;

    public InviteServiceImpl(VolunteerPreferenceRepository preferences, EventInviteRepository invites,
                             EventJpaRepository events, EventRegistrationJpaRepository registrations,
                             CategoryJpaRepository categories, EventService eventService, ModelMapper modelMapper) {
        this.preferences = preferences;
        this.invites = invites;
        this.events = events;
        this.registrations = registrations;
        this.categories = categories;
        this.eventService = eventService;
        this.modelMapper = modelMapper;
    }

    // ---- Preferences ----

    @Override
    public PreferencesDto getPreferences(Caller volunteer) {
        return toDto(preferences.findById(volunteer.username()).orElseGet(VolunteerPreference::new));
    }

    @Override
    @Transactional
    public PreferencesDto savePreferences(PreferencesRequest request, Caller volunteer) {
        if (volunteer.isOrganizer()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Preferences are for volunteer accounts");
        }
        Set<Long> known = categories.findAll().stream().map(Category::getId).collect(Collectors.toSet());
        VolunteerPreference preference = preferences.findById(volunteer.username()).orElseGet(() -> {
            VolunteerPreference fresh = new VolunteerPreference();
            fresh.setUsername(volunteer.username());
            return fresh;
        });
        preference.setName(volunteer.displayName());
        preference.setArea(request.getArea() == null || request.getArea().isBlank() ? null : request.getArea().trim());
        preference.setInterests(request.getInterests().stream().filter(known::contains).collect(Collectors.toCollection(HashSet::new)));
        if (request.getAvailability() != null) {
            preference.setAvailability(request.getAvailability().stream().filter(TimeSlots::isValid)
                    .collect(Collectors.toCollection(HashSet::new)));
        }
        preference.setDiscoverable(request.isDiscoverable());
        if (request.getMutedOrganizers() != null) {
            // Only ever unmute here; muting happens when declining an invitation.
            preference.getMutedOrganizers().retainAll(request.getMutedOrganizers());
        }
        preference.setUpdatedDate(LocalDateTime.now());
        return toDto(preferences.save(preference));
    }

    private PreferencesDto toDto(VolunteerPreference preference) {
        List<String> interests = preference.getInterests().stream().sorted().map(String::valueOf).toList();
        List<PreferencesDto.MutedOrganizerDto> muted = preference.getMutedOrganizers().stream().sorted()
                .map(organizer -> new PreferencesDto.MutedOrganizerDto(organizer, organizerName(organizer)))
                .toList();
        List<String> availability = TimeSlots.ALL.stream().filter(preference.getAvailability()::contains).toList();
        return new PreferencesDto(interests, preference.getArea(), availability, preference.isDiscoverable(), muted);
    }

    private String organizerName(String organizer) {
        return events.findFirstByCreatedByOrderByCreatedDateDesc(organizer)
                .map(Event::getOrganizerName)
                .filter(Objects::nonNull)
                .orElse(organizer);
    }

    // ---- Finding volunteers ----

    @Override
    public List<VolunteerMatchDto> findVolunteers(Long eventId, Long categoryId, String area, boolean experiencedOnly,
                                                  Caller organizer) {
        requireOrganizer(organizer);
        Event event = eventId != null ? requireOwnEvent(String.valueOf(eventId), organizer) : null;
        Map<Long, String> categoryNames = categories.findAll().stream()
                .collect(Collectors.toMap(Category::getId, Category::getCategory));

        List<VolunteerPreference> candidates = preferences.findByDiscoverableTrue().stream()
                .filter(p -> !p.getUsername().equals(organizer.username()))
                .filter(p -> !p.getMutedOrganizers().contains(organizer.username()))
                .toList();
        Map<String, List<EventRegistration>> attended = registrations
                .findByAttendedTrueAndUsernameIn(candidates.stream().map(VolunteerPreference::getUsername).toList())
                .stream().collect(Collectors.groupingBy(EventRegistration::getUsername));
        Map<String, String> statuses = event != null ? statusesFor(event) : Map.of();
        String wantedArea = area == null || area.isBlank() ? null : area.trim().toLowerCase();

        List<VolunteerMatchDto> matches = new ArrayList<>();
        for (VolunteerPreference candidate : candidates) {
            List<EventRegistration> record = attended.getOrDefault(candidate.getUsername(), List.of());
            int causeEvents = categoryId == null ? record.size()
                    : (int) record.stream().filter(r -> categoryId.equals(r.getEvent().getCategoryId())).count();
            boolean interested = categoryId == null || candidate.getInterests().contains(categoryId);
            if (!interested && causeEvents == 0) {
                continue;
            }
            if (experiencedOnly && causeEvents == 0) {
                continue;
            }
            if (wantedArea != null && (candidate.getArea() == null || !candidate.getArea().toLowerCase().contains(wantedArea))) {
                continue;
            }
            double hours = record.stream().mapToDouble(r -> r.getHours() == null ? 0 : r.getHours()).sum();
            int withYou = (int) record.stream().filter(r -> organizer.username().equals(r.getEvent().getCreatedBy())).count();
            List<String> causes = candidate.getInterests().stream().map(categoryNames::get).filter(Objects::nonNull).sorted().toList();
            matches.add(new VolunteerMatchDto(candidate.getUsername(), shortName(candidate), candidate.getArea(), causes,
                    hours, record.size(), causeEvents, withYou, statuses.get(candidate.getUsername())));
        }
        // People who've helped you before first, then the most experienced in this cause.
        matches.sort(Comparator.comparingInt(VolunteerMatchDto::getEventsWithYou).reversed()
                .thenComparing(Comparator.comparingInt(VolunteerMatchDto::getCauseEvents).reversed())
                .thenComparing(Comparator.comparingDouble(VolunteerMatchDto::getVerifiedHours).reversed())
                .thenComparing(VolunteerMatchDto::getName, String.CASE_INSENSITIVE_ORDER));
        return matches.size() > MAX_RESULTS ? matches.subList(0, MAX_RESULTS) : matches;
    }

    // Where each volunteer stands for this event: JOINED, or the state of their invitation.
    private Map<String, String> statusesFor(Event event) {
        Set<String> joined = registrations.findByEventIdOrderByCreatedDateAsc(event.getId()).stream()
                .map(EventRegistration::getUsername).collect(Collectors.toSet());
        Map<String, String> statuses = invites.findByEventIdOrderByCreatedDateDesc(event.getId()).stream()
                .collect(Collectors.toMap(EventInvite::getUsername, invite -> inviteStatus(invite, joined), (a, b) -> a));
        joined.forEach(username -> statuses.put(username, "JOINED"));
        return statuses;
    }

    private static String inviteStatus(EventInvite invite, Set<String> joined) {
        if (joined.contains(invite.getUsername())) {
            return "JOINED";
        }
        return switch (invite.getStatus()) {
            case PENDING -> "INVITED";
            case DECLINED -> "DECLINED";
            // Accepted, then left the event.
            case ACCEPTED -> "LEFT";
        };
    }

    // "Priya Nair" -> "Priya N.": enough to recognise someone, without their full name.
    static String shortName(VolunteerPreference preference) {
        String name = preference.getName() != null ? preference.getName().trim() : preference.getUsername();
        String[] parts = name.split("\\s+");
        return parts.length < 2 ? name : parts[0] + " " + parts[parts.length - 1].charAt(0) + ".";
    }

    // ---- Invitations ----

    @Override
    @Transactional
    public InviteResultDto invite(String eventId, InviteRequest request, Caller organizer) {
        Event event = requireOwnEvent(eventId, organizer);
        LocalDateTime end = event.getToDate() != null ? event.getToDate() : event.getFromDate();
        if (!Boolean.TRUE.equals(event.getIsActive()) || end.isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You can only invite people to upcoming events");
        }
        int remaining = inviteLimit(event) - (int) invites.countByEventId(event.getId());
        String message = request.getMessage() == null || request.getMessage().isBlank() ? null : request.getMessage().trim();
        Map<String, VolunteerPreference> findable = preferences.findAllById(request.getUsernames()).stream()
                .filter(VolunteerPreference::isDiscoverable)
                .filter(p -> !p.getMutedOrganizers().contains(organizer.username()))
                .collect(Collectors.toMap(VolunteerPreference::getUsername, Function.identity()));

        int invited = 0;
        Set<String> usernames = new LinkedHashSet<>(request.getUsernames());
        for (String username : usernames) {
            VolunteerPreference volunteer = findable.get(username);
            if (volunteer == null || remaining <= 0
                    || invites.findByEventIdAndUsername(event.getId(), username).isPresent()
                    || registrations.existsByEventIdAndUsername(event.getId(), username)) {
                continue;
            }
            EventInvite invite = new EventInvite();
            invite.setEvent(event);
            invite.setUsername(username);
            invite.setVolunteerName(volunteer.getName());
            invite.setInvitedBy(organizer.username());
            invite.setMessage(message);
            invite.setStatus(InviteStatus.PENDING);
            invite.setCreatedDate(LocalDateTime.now());
            invites.save(invite);
            invited++;
            remaining--;
        }
        return new InviteResultDto(invited, usernames.size() - invited, Math.max(0, remaining));
    }

    static int inviteLimit(Event event) {
        if (event.getNoOfParticipant() == null) {
            return INVITES_WITHOUT_LIMIT;
        }
        return Math.max(MIN_INVITES, event.getNoOfParticipant() * INVITES_PER_SPOT);
    }

    @Override
    public List<InviteDto> getInvites(String eventId, Caller organizer) {
        Event event = requireOwnEvent(eventId, organizer);
        Set<String> joined = registrations.findByEventIdOrderByCreatedDateAsc(event.getId()).stream()
                .map(EventRegistration::getUsername).collect(Collectors.toSet());
        return invites.findByEventIdOrderByCreatedDateDesc(event.getId()).stream()
                .map(invite -> new InviteDto(invite.getUsername(),
                        invite.getVolunteerName() != null ? invite.getVolunteerName() : invite.getUsername(),
                        inviteStatus(invite, joined), invite.getCreatedDate()))
                .toList();
    }

    @Override
    public List<MyInviteDto> getMyInvites(Caller volunteer) {
        LocalDateTime now = LocalDateTime.now();
        return invites.findByUsernameAndStatusOrderByCreatedDateDesc(volunteer.username(), InviteStatus.PENDING).stream()
                .filter(invite -> Boolean.TRUE.equals(invite.getEvent().getIsActive()))
                .filter(invite -> {
                    Event event = invite.getEvent();
                    LocalDateTime end = event.getToDate() != null ? event.getToDate() : event.getFromDate();
                    return end.isAfter(now);
                })
                .filter(invite -> !registrations.existsByEventIdAndUsername(invite.getEvent().getId(), volunteer.username()))
                .map(invite -> new MyInviteDto(invite.getId(), modelMapper.map(invite.getEvent(), EventDto.class),
                        invite.getEvent().getOrganizerName(), invite.getMessage(), invite.getCreatedDate()))
                .toList();
    }

    @Override
    @Transactional
    public EventDto accept(Long inviteId, Caller volunteer) {
        EventInvite invite = requireOwnInvite(inviteId, volunteer);
        EventDto joined = eventService.joinEvent(String.valueOf(invite.getEvent().getId()), volunteer);
        invite.setStatus(InviteStatus.ACCEPTED);
        invite.setRespondedDate(LocalDateTime.now());
        invites.save(invite);
        return joined;
    }

    @Override
    @Transactional
    public void decline(Long inviteId, boolean muteOrganizer, Caller volunteer) {
        EventInvite invite = requireOwnInvite(inviteId, volunteer);
        invite.setStatus(InviteStatus.DECLINED);
        invite.setRespondedDate(LocalDateTime.now());
        invites.save(invite);
        if (muteOrganizer) {
            VolunteerPreference preference = preferences.findById(volunteer.username()).orElseGet(() -> {
                VolunteerPreference fresh = new VolunteerPreference();
                fresh.setUsername(volunteer.username());
                fresh.setName(volunteer.displayName());
                return fresh;
            });
            preference.getMutedOrganizers().add(invite.getInvitedBy());
            preference.setUpdatedDate(LocalDateTime.now());
            preferences.save(preference);
        }
    }

    private EventInvite requireOwnInvite(Long inviteId, Caller volunteer) {
        // Someone else's invitation reads as not found, so ids can't be probed.
        return invites.findById(inviteId)
                .filter(invite -> invite.getUsername().equals(volunteer.username()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));
    }

    private static void requireOrganizer(Caller caller) {
        if (!caller.isOrganizer()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only organizer accounts can find volunteers");
        }
    }

    private Event requireOwnEvent(String eventId, Caller organizer) {
        Event event = events.findById(Long.valueOf(eventId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        if (!organizer.username().equals(event.getCreatedBy())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only this event's organizer can do that");
        }
        return event;
    }
}
