package com.quad.service;

import com.quad.dto.EventDto;
import com.quad.dto.VolunteerDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EventService {

    Page<EventDto> getAllEvents(Pageable pageable);

    EventDto findEventById(String eventId);

    Page<EventDto> getEventByCategoryId(String categoryId, Pageable pageable);
}
