package com.quad.service.impl;

import com.quad.dto.AttendanceUpdateRequest;
import com.quad.dto.CheckInCodeDto;
import com.quad.dto.CheckInResultDto;
import com.quad.dto.HoursEntryDto;
import com.quad.dto.HoursRecordDto;
import com.quad.dto.VolunteerSignupDto;
import com.quad.entity.Address;
import com.quad.entity.Event;
import com.quad.entity.EventRegistration;
import com.quad.repository.EventJpaRepository;
import com.quad.repository.EventRegistrationJpaRepository;
import com.quad.security.Caller;
import com.quad.service.AttendanceService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * QR check-in and verified volunteering hours. Volunteers check in by scanning the event's QR code between
 * {@link #OPENS_BEFORE_START} before the start and {@link #CLOSES_AFTER_END} after the end; the organizer can
 * also mark attendance by hand. Each verified attendance gets a public verification code for certificates.
 */
@Service
public class AttendanceServiceImpl implements AttendanceService {

    static final Duration OPENS_BEFORE_START = Duration.ofHours(1);
    static final Duration CLOSES_AFTER_END = Duration.ofHours(3);
    // No 0/O/1/I, so codes typed by hand are unambiguous.
    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final EventJpaRepository eventJpaRepository;
    private final EventRegistrationJpaRepository registrations;

    public AttendanceServiceImpl(EventJpaRepository eventJpaRepository, EventRegistrationJpaRepository registrations) {
        this.eventJpaRepository = eventJpaRepository;
        this.registrations = registrations;
    }

    @Override
    @Transactional
    public CheckInCodeDto getCheckInCode(String eventId, Caller organizer) {
        Event event = requireOwnEvent(eventId, organizer);
        if (event.getCheckInCode() == null) {
            event.setCheckInCode(newCheckInCode());
            eventJpaRepository.save(event);
        }
        return new CheckInCodeDto(event.getCheckInCode(), opensAt(event), closesAt(event));
    }

    @Override
    @Transactional
    public CheckInResultDto checkIn(String eventId, String code, Caller volunteer) {
        Event event = requireEvent(eventId);
        if (event.getCheckInCode() == null || !event.getCheckInCode().equalsIgnoreCase(code.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This check-in code isn't valid for this event");
        }
        if (!Boolean.TRUE.equals(event.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This event was cancelled");
        }
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(opensAt(event))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Check-in opens an hour before the event starts");
        }
        if (now.isAfter(closesAt(event))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Check-in for this event has closed");
        }
        if (volunteer.username().equals(event.getCreatedBy())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You're organizing this event");
        }

        EventRegistration registration = registrations.findByEventIdAndUsername(event.getId(), volunteer.username())
                .orElseGet(() -> walkIn(event, volunteer));
        boolean already = Boolean.TRUE.equals(registration.getAttended());
        if (!already) {
            registration.setCheckedInAt(now);
            markPresent(registration, event, null);
            registrations.save(registration);
        }
        return new CheckInResultDto(event.getId(), event.getName(), registration.getHours(),
                registration.getVerificationCode(), already);
    }

    @Override
    @Transactional
    public VolunteerSignupDto updateAttendance(String eventId, String username, AttendanceUpdateRequest request,
                                               Caller organizer) {
        Event event = requireOwnEvent(eventId, organizer);
        if (LocalDateTime.now().isBefore(opensAt(event))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Attendance can be recorded once the event is about to start");
        }
        EventRegistration registration = registrations.findByEventIdAndUsername(event.getId(), username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "This volunteer hasn't joined the event"));
        if (request.getAttended()) {
            markPresent(registration, event, request.getHours());
        } else {
            // A no-show: withdraw any hours and invalidate the certificate.
            registration.setAttended(false);
            registration.setHours(null);
            registration.setVerificationCode(null);
        }
        registrations.save(registration);
        return new VolunteerSignupDto(registration.getUsername(), nameOf(registration), registration.getCreatedDate(),
                registration.getAttended(), registration.getCheckedInAt(), registration.getHours());
    }

    @Override
    public HoursRecordDto getMyHours(Caller volunteer) {
        List<HoursEntryDto> entries = registrations.findByUsernameAndAttendedTrueOrderByEventFromDateDesc(volunteer.username())
                .stream().map(AttendanceServiceImpl::toEntry).toList();
        double total = entries.stream().mapToDouble(e -> e.getHours() == null ? 0 : e.getHours()).sum();
        return new HoursRecordDto(total, entries);
    }

    @Override
    public HoursEntryDto verify(String verificationCode) {
        return registrations.findByVerificationCode(verificationCode)
                .filter(r -> Boolean.TRUE.equals(r.getAttended()))
                .map(AttendanceServiceImpl::toEntry)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No verified record matches this code"));
    }

    private EventRegistration walkIn(Event event, Caller volunteer) {
        if (event.getNoOfParticipant() != null && registrations.countByEventId(event.getId()) >= event.getNoOfParticipant()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This event is full, so walk-in check-in isn't possible");
        }
        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setUsername(volunteer.username());
        registration.setVolunteerName(volunteer.displayName());
        registration.setCreatedDate(LocalDateTime.now());
        return registration;
    }

    private static void markPresent(EventRegistration registration, Event event, Double hours) {
        registration.setAttended(true);
        registration.setHours(hours != null ? hours : scheduledHours(event));
        if (registration.getVerificationCode() == null) {
            registration.setVerificationCode(UUID.randomUUID().toString());
        }
    }

    // The event's scheduled length, rounded to the nearest half hour (at least half an hour).
    static double scheduledHours(Event event) {
        if (event.getFromDate() == null || event.getToDate() == null) {
            return 1.0;
        }
        double hours = Duration.between(event.getFromDate(), event.getToDate()).toMinutes() / 60.0;
        return Math.max(0.5, Math.round(hours * 2) / 2.0);
    }

    private static LocalDateTime opensAt(Event event) {
        return event.getFromDate().minus(OPENS_BEFORE_START);
    }

    private static LocalDateTime closesAt(Event event) {
        LocalDateTime end = event.getToDate() != null ? event.getToDate() : event.getFromDate();
        return end.plus(CLOSES_AFTER_END);
    }

    private static String newCheckInCode() {
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            code.append(CODE_ALPHABET.charAt(RANDOM.nextInt(CODE_ALPHABET.length())));
        }
        return code.toString();
    }

    private static String nameOf(EventRegistration registration) {
        return registration.getVolunteerName() != null ? registration.getVolunteerName() : registration.getUsername();
    }

    private static HoursEntryDto toEntry(EventRegistration registration) {
        Event event = registration.getEvent();
        Address address = event.getAddress();
        String place = address == null ? null : Stream.of(address.getArea(),
                        address.getPincode() != null ? "Singapore " + address.getPincode() : null)
                .filter(part -> part != null && !part.isBlank())
                .collect(Collectors.joining(", "));
        return new HoursEntryDto(event.getId(), event.getName(),
                event.getOrganizerName() != null ? event.getOrganizerName() : event.getCreatedBy(),
                event.getCategory() != null ? event.getCategory().getCategory() : null,
                place, event.getFromDate(), event.getToDate(), nameOf(registration), registration.getHours(),
                registration.getVerificationCode());
    }

    private Event requireEvent(String eventId) {
        return eventJpaRepository.findById(Long.valueOf(eventId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
    }

    private Event requireOwnEvent(String eventId, Caller organizer) {
        Event event = requireEvent(eventId);
        if (!organizer.username().equals(event.getCreatedBy())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only this event's organizer can do that");
        }
        return event;
    }
}
