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
import org.springframework.web.bind.annotation.*;
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
    public Mono<Page<VolunteerDto>> getVolunteers(@RequestBody Pageable pageable){
        return Mono.just(volunteerService.getAllVolunteers(pageable));
    }

    @GetMapping("/volunteer/{volunteerId}")
    public Mono<VolunteerDto> getVolunteer(@PathVariable("volunteerId") String volunteerId){
        return Mono.just(volunteerService.findVolunteerById(volunteerId));
    }

    @GetMapping("/organizers")
    public Mono<Page<OrganizerDto>> getOrganizers(@RequestBody Pageable pageable){
        return Mono.just(organizerService.getAllOrganizers(pageable));
    }

    @GetMapping("/organizers/{organizerId}")
    public Mono<OrganizerDto> getOrganizer(@PathVariable("organizerId") String volunteerId){
        return Mono.just(organizerService.findOrganizerById(volunteerId));
    }

    @GetMapping("/events")
    public Mono<Page<EventDto>> getEvents(@RequestBody Pageable pageable){
        return Mono.just(eventService.getAllEvents(pageable));
    }

    @GetMapping("/events/{eventId}")
    public Mono<EventDto> getEvents(@PathVariable("eventId") String eventId){
        return Mono.just(eventService.findEventById(eventId));
    }

    @GetMapping("/events/categories/{categoryId}")
    public Mono<Page<EventDto>> getEvents(@PathVariable("categoryId") String categoryId,@RequestBody Pageable pageable){
        return Mono.just(eventService.getEventByCategoryId(categoryId,pageable));
    }
}
