package com.quad.service.impl;

import com.quad.dto.CategoryDto;
import com.quad.dto.CreateEventRequest;
import com.quad.dto.EventDto;
import com.quad.dto.MyEventsDto;
import com.quad.dto.VolunteerSignupDto;
import com.quad.entity.Address;
import com.quad.entity.Category;
import com.quad.entity.Event;
import com.quad.entity.EventRegistration;
import com.quad.repository.CategoryJpaRepository;
import com.quad.repository.EventJpaRepository;
import com.quad.repository.EventRegistrationJpaRepository;
import com.quad.security.Caller;
import com.quad.service.EventService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventServiceImpl implements EventService {

    @Autowired
    EventJpaRepository eventJpaRepository;
    @Autowired
    CategoryJpaRepository categoryJpaRepository;
    @Autowired
    EventRegistrationJpaRepository eventRegistrationJpaRepository;
    @Autowired
    ModelMapper modelMapper;

    @Override
    public Page<EventDto> getAllEvents(Pageable pageable) {
        Page<Event> eventDtos=eventJpaRepository.findUpcoming(LocalDateTime.now(), pageable);
        return eventDtos.map(event -> modelMapper.map(event, EventDto.class));
    }

    @Override
    public EventDto findEventById(String eventId) {
        Optional<Event> eventDtos= eventJpaRepository.findById(Long.valueOf(eventId));
        if(eventDtos.isPresent()) {
            Event event = eventDtos.get();
            return modelMapper.map(event, EventDto.class);
        }else{
            return null;
        }
    }

    @Override
    public Page<EventDto> getEventByCategoryId(String categoryId, Pageable pageable) {
        Page<Event> eventDtos=eventJpaRepository.findUpcomingByCategory(Long.valueOf(categoryId), LocalDateTime.now(), pageable);
        return eventDtos.map(event -> modelMapper.map(event, EventDto.class));
    }

    @Override
    public EventDto createEvent(CreateEventRequest request, Caller organizer) {
        if (!organizer.isOrganizer()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only organizer accounts can post events");
        }
        Event event = new Event();
        applyDetails(event, request);
        event.setIsActive(true);
        event.setCreatedBy(organizer.username());
        event.setOrganizerName(organizer.displayName());
        event.setCreatedDate(LocalDateTime.now());

        return modelMapper.map(eventJpaRepository.save(event), EventDto.class);
    }

    @Override
    @Transactional
    public EventDto updateEvent(String eventId, CreateEventRequest request, Caller organizer) {
        Event event = requireOwnEvent(eventId, organizer);
        if (!Boolean.TRUE.equals(event.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cancelled events can't be edited");
        }
        long joined = eventRegistrationJpaRepository.countByEventId(event.getId());
        if (request.getNoOfParticipant() != null && request.getNoOfParticipant() < joined) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    joined + " volunteers have already joined, so you need at least " + joined + " spots");
        }
        applyDetails(event, request);
        return toDtoWithCount(eventJpaRepository.save(event));
    }

    @Override
    @Transactional
    public EventDto cancelEvent(String eventId, Caller organizer) {
        Event event = requireOwnEvent(eventId, organizer);
        event.setIsActive(false);
        return toDtoWithCount(eventJpaRepository.save(event));
    }

    @Override
    public List<VolunteerSignupDto> getVolunteers(String eventId, Caller organizer) {
        Event event = requireOwnEvent(eventId, organizer);
        return eventRegistrationJpaRepository.findByEventIdOrderByCreatedDateAsc(event.getId()).stream()
                .map(r -> new VolunteerSignupDto(r.getUsername(),
                        r.getVolunteerName() != null ? r.getVolunteerName() : r.getUsername(), r.getCreatedDate(),
                        r.getAttended(), r.getCheckedInAt(), r.getHours()))
                .toList();
    }

    private void applyDetails(Event event, CreateEventRequest request) {
        if (!request.getToDate().isAfter(request.getFromDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The end date must be after the start date");
        }
        Category category = categoryJpaRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown category"));
        event.setName(request.getName().trim());
        event.setDescription(request.getDescription());
        event.setCategory(category);
        event.setFromDate(request.getFromDate());
        event.setToDate(request.getToDate());
        event.setNoOfParticipant(request.getNoOfParticipant());
        if (request.getAddress() != null) {
            // Update the existing address row in place rather than orphaning it.
            Address address = event.getAddress() != null ? event.getAddress() : new Address();
            modelMapper.map(request.getAddress(), address);
            event.setAddress(address);
        }
    }

    // Only the organizer who posted an event may manage it.
    private Event requireOwnEvent(String eventId, Caller organizer) {
        Event event = requireEvent(eventId);
        if (!organizer.username().equals(event.getCreatedBy())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only this event's organizer can do that");
        }
        return event;
    }

    @Override
    public List<CategoryDto> getAllCategories() {
        return categoryJpaRepository.findAll(Sort.by("category")).stream()
                .map(category -> modelMapper.map(category, CategoryDto.class))
                .toList();
    }

    @Override
    @Transactional
    public EventDto joinEvent(String eventId, Caller volunteer) {
        String username = volunteer.username();
        Event event = requireEvent(eventId);
        if (username.equals(event.getCreatedBy())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You're organizing this event");
        }
        if (!Boolean.TRUE.equals(event.getIsActive()) || hasEnded(event)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This event is no longer taking volunteers");
        }
        if (eventRegistrationJpaRepository.existsByEventIdAndUsername(event.getId(), username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already joined this event");
        }
        if (event.getNoOfParticipant() != null
                && eventRegistrationJpaRepository.countByEventId(event.getId()) >= event.getNoOfParticipant()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This event is full");
        }

        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setUsername(username);
        registration.setVolunteerName(volunteer.displayName());
        registration.setCreatedDate(LocalDateTime.now());
        eventRegistrationJpaRepository.save(registration);

        return toDtoWithCount(event);
    }

    @Override
    @Transactional
    public EventDto leaveEvent(String eventId, String username) {
        Event event = requireEvent(eventId);
        eventRegistrationJpaRepository.findByEventIdAndUsername(event.getId(), username)
                .ifPresent(eventRegistrationJpaRepository::delete);
        return toDtoWithCount(event);
    }

    @Override
    public MyEventsDto getMyEvents(String username) {
        List<EventDto> joined = eventRegistrationJpaRepository.findByUsernameOrderByEventFromDateAsc(username).stream()
                .map(registration -> modelMapper.map(registration.getEvent(), EventDto.class))
                .toList();
        List<EventDto> organizing = eventJpaRepository.findByCreatedByOrderByFromDateAsc(username).stream()
                .map(event -> modelMapper.map(event, EventDto.class))
                .toList();
        return new MyEventsDto(joined, organizing);
    }

    private Event requireEvent(String eventId) {
        return eventJpaRepository.findById(Long.valueOf(eventId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
    }

    private static boolean hasEnded(Event event) {
        LocalDateTime end = event.getToDate() != null ? event.getToDate() : event.getFromDate();
        return end != null && end.isBefore(LocalDateTime.now());
    }

    // volunteersJoined is a formula loaded with the entity, so recount after a join/leave in the same request.
    private EventDto toDtoWithCount(Event event) {
        EventDto dto = modelMapper.map(event, EventDto.class);
        dto.setVolunteersJoined((int) eventRegistrationJpaRepository.countByEventId(event.getId()));
        return dto;
    }
}
