package com.quad.controller;

import com.quad.dto.CategoryDto;
import com.quad.dto.CreateEventRequest;
import com.quad.dto.EventDto;
import com.quad.dto.MyEventsDto;
import com.quad.dto.OrganizerDto;
import com.quad.dto.VolunteerDto;
import com.quad.service.EventService;
import com.quad.service.OrganizerService;
import com.quad.service.VolunteerService;
import com.quad.security.RequireLoginInterceptor;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.List;

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

    @PostMapping("/events")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<EventDto> createEvent(@RequestAttribute(RequireLoginInterceptor.USERNAME_ATTRIBUTE) String username,
                                      @Valid @RequestBody CreateEventRequest request){
        return Mono.just(eventService.createEvent(request, username));
    }

    @GetMapping("/categories")
    public Mono<List<CategoryDto>> getCategories(){
        return Mono.just(eventService.getAllCategories());
    }

    @PostMapping("/events/{eventId}/volunteers")
    public Mono<EventDto> joinEvent(@PathVariable("eventId") String eventId,
                                    @RequestAttribute(RequireLoginInterceptor.USERNAME_ATTRIBUTE) String username){
        return Mono.just(eventService.joinEvent(eventId, username));
    }

    @DeleteMapping("/events/{eventId}/volunteers")
    public Mono<EventDto> leaveEvent(@PathVariable("eventId") String eventId,
                                     @RequestAttribute(RequireLoginInterceptor.USERNAME_ATTRIBUTE) String username){
        return Mono.just(eventService.leaveEvent(eventId, username));
    }

    @GetMapping("/me/events")
    public Mono<MyEventsDto> getMyEvents(@RequestAttribute(RequireLoginInterceptor.USERNAME_ATTRIBUTE) String username){
        return Mono.just(eventService.getMyEvents(username));
    }
}
