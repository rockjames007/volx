package com.quad.service.impl;

import com.quad.dto.CategoryDto;
import com.quad.dto.CreateEventRequest;
import com.quad.dto.EventDto;
import com.quad.entity.Address;
import com.quad.entity.Category;
import com.quad.entity.Event;
import com.quad.repository.CategoryJpaRepository;
import com.quad.repository.EventJpaRepository;
import com.quad.service.EventService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
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
    ModelMapper modelMapper;

    @Override
    public Page<EventDto> getAllEvents(Pageable pageable) {
        Page<Event> eventDtos=eventJpaRepository.findByIsActiveTrue(pageable);
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
        Page<Event> eventDtos=eventJpaRepository.findByIsActiveTrueAndCategoryId(pageable,Long.valueOf(categoryId));
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
}
