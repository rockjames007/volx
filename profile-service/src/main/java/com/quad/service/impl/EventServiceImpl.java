package com.quad.service.impl;

import com.quad.dto.CategoryDto;
import com.quad.dto.CreateEventRequest;
import com.quad.dto.EventDto;
import com.quad.dto.MyEventsDto;
import com.quad.entity.Address;
import com.quad.entity.Category;
import com.quad.entity.Event;
import com.quad.entity.EventRegistration;
import com.quad.repository.CategoryJpaRepository;
import com.quad.repository.EventJpaRepository;
import com.quad.repository.EventRegistrationJpaRepository;
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
    public EventDto createEvent(CreateEventRequest request, String createdBy) {
        if (!request.getToDate().isAfter(request.getFromDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The end date must be after the start date");
        }
        Category category = categoryJpaRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown category"));

        Event event = new Event();
        event.setName(request.getName().trim());
        event.setDescription(request.getDescription());
        event.setCategory(category);
        event.setFromDate(request.getFromDate());
        event.setToDate(request.getToDate());
        event.setNoOfParticipant(request.getNoOfParticipant());
        if (request.getAddress() != null) {
            event.setAddress(modelMapper.map(request.getAddress(), Address.class));
        }
        event.setIsActive(true);
        event.setCreatedBy(createdBy);
        event.setCreatedDate(LocalDateTime.now());

        return modelMapper.map(eventJpaRepository.save(event), EventDto.class);
    }

    @Override
    public List<CategoryDto> getAllCategories() {
        return categoryJpaRepository.findAll(Sort.by("category")).stream()
                .map(category -> modelMapper.map(category, CategoryDto.class))
                .toList();
    }

    @Override
    @Transactional
    public EventDto joinEvent(String eventId, String username) {
        Event event = requireEvent(eventId);
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
