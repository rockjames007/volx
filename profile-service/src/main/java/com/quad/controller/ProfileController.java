package com.quad.controller;

import com.quad.dto.EventDto;
import com.quad.dto.OrganizerDto;
import com.quad.dto.VolunteerDto;
import com.quad.service.EventService;
import com.quad.service.OrganizerService;
import com.quad.service.VolunteerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/profile")
public class ProfileController {

    @Autowired
    VolunteerService volunteerService;
    @Autowired
    OrganizerService organizerService;
    @Autowired
    EventService eventService;

    @GetMapping("/volunteers")
    public Mono<Page<VolunteerDto>> getVolunteers(@PageableDefault(size = 20) Pageable pageable){
        return Mono.just(volunteerService.getAllVolunteers(pageable));
    }

    @GetMapping("/volunteer/{volunteerId}")
    public Mono<VolunteerDto> getVolunteer(@PathVariable("volunteerId") String volunteerId){
        return Mono.justOrEmpty(volunteerService.findVolunteerById(volunteerId))
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    @GetMapping("/organizers")
    public Mono<Page<OrganizerDto>> getOrganizers(@PageableDefault(size = 20) Pageable pageable){
        return Mono.just(organizerService.getAllOrganizers(pageable));
    }

    @GetMapping("/organizers/{organizerId}")
    public Mono<OrganizerDto> getOrganizer(@PathVariable("organizerId") String organizerId){
        return Mono.justOrEmpty(organizerService.findOrganizerById(organizerId))
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    @GetMapping("/events")
    public Mono<Page<EventDto>> getEvents(@PageableDefault(size = 20) Pageable pageable){
        return Mono.just(eventService.getAllEvents(pageable));
    }

    @GetMapping("/events/{eventId}")
    public Mono<EventDto> getEvent(@PathVariable("eventId") String eventId){
        return Mono.justOrEmpty(eventService.findEventById(eventId))
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    @GetMapping("/events/categories/{categoryId}")
    public Mono<Page<EventDto>> getEventsByCategory(@PathVariable("categoryId") String categoryId,@PageableDefault(size = 20) Pageable pageable){
        return Mono.just(eventService.getEventByCategoryId(categoryId,pageable));
    }
}
