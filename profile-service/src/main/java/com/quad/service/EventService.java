package com.quad.service;

import com.quad.dto.CategoryDto;
import com.quad.dto.CreateEventRequest;
import com.quad.dto.EventDto;
import com.quad.dto.MyEventsDto;
import com.quad.dto.VolunteerSignupDto;
import com.quad.security.Caller;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EventService {

    Page<EventDto> getAllEvents(Pageable pageable);

    EventDto findEventById(String eventId);

    Page<EventDto> getEventByCategoryId(String categoryId, Pageable pageable);

    EventDto createEvent(CreateEventRequest request, Caller organizer);

    EventDto updateEvent(String eventId, CreateEventRequest request, Caller organizer);

    EventDto cancelEvent(String eventId, Caller organizer);

    List<VolunteerSignupDto> getVolunteers(String eventId, Caller organizer);

    List<CategoryDto> getAllCategories();

    EventDto joinEvent(String eventId, Caller volunteer);

    EventDto leaveEvent(String eventId, String username);

    MyEventsDto getMyEvents(String username);
}
