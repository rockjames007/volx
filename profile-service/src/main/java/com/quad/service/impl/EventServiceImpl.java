package com.quad.service.impl;

import com.quad.dto.EventDto;
import com.quad.dto.OrganizerDto;
import com.quad.dto.VolunteerDto;
import com.quad.entity.Event;
import com.quad.entity.Users;
import com.quad.repository.EventJpaRepository;
import com.quad.repository.UsersJpaRepository;
import com.quad.service.EventService;
import com.quad.service.OrganizerService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EventServiceImpl implements EventService {

    @Autowired
    EventJpaRepository eventJpaRepository;
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
}
