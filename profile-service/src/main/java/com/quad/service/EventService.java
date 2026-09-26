package com.quad.service;

import com.quad.dto.CategoryDto;
import com.quad.dto.CreateEventRequest;
import com.quad.dto.EventDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EventService {

    Page<EventDto> getAllEvents(Pageable pageable);

    EventDto findEventById(String eventId);

    Page<EventDto> getEventByCategoryId(String categoryId, Pageable pageable);

    EventDto createEvent(CreateEventRequest request, String createdBy);

    List<CategoryDto> getAllCategories();
}
