package com.quad.controller;

import com.quad.dto.DeclineInviteRequest;
import com.quad.dto.EventDto;
import com.quad.dto.InviteDto;
import com.quad.dto.InviteRequest;
import com.quad.dto.InviteResultDto;
import com.quad.dto.MyInviteDto;
import com.quad.dto.PreferencesDto;
import com.quad.dto.PreferencesRequest;
import com.quad.dto.VolunteerMatchDto;
import com.quad.security.Caller;
import com.quad.security.RequireLoginInterceptor;
import com.quad.service.InviteService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

// Volunteer preferences, organizers finding volunteers, and invitations.
@RestController
@RequestMapping("/profile")
public class InviteController {

    private final InviteService inviteService;

    public InviteController(InviteService inviteService) {
        this.inviteService = inviteService;
    }

    @GetMapping("/me/preferences")
    public Mono<PreferencesDto> getPreferences(@RequestAttribute(RequireLoginInterceptor.CALLER_ATTRIBUTE) Caller caller){
        return Mono.just(inviteService.getPreferences(caller));
    }

    @PutMapping("/me/preferences")
    public Mono<PreferencesDto> savePreferences(@RequestAttribute(RequireLoginInterceptor.CALLER_ATTRIBUTE) Caller caller,
                                                @Valid @RequestBody PreferencesRequest request){
        return Mono.just(inviteService.savePreferences(request, caller));
    }

    @GetMapping("/volunteers/search")
    public Mono<List<VolunteerMatchDto>> findVolunteers(@RequestParam(value = "eventId", required = false) Long eventId,
                                                        @RequestParam(value = "categoryId", required = false) Long categoryId,
                                                        @RequestParam(value = "area", required = false) String area,
                                                        @RequestParam(value = "experienced", defaultValue = "false") boolean experienced,
                                                        @RequestAttribute(RequireLoginInterceptor.CALLER_ATTRIBUTE) Caller caller){
        return Mono.just(inviteService.findVolunteers(eventId, categoryId, area, experienced, caller));
    }

    @PostMapping("/events/{eventId}/invites")
    public Mono<InviteResultDto> invite(@PathVariable("eventId") String eventId,
                                        @RequestAttribute(RequireLoginInterceptor.CALLER_ATTRIBUTE) Caller caller,
                                        @Valid @RequestBody InviteRequest request){
        return Mono.just(inviteService.invite(eventId, request, caller));
    }

    @GetMapping("/events/{eventId}/invites")
    public Mono<List<InviteDto>> getInvites(@PathVariable("eventId") String eventId,
                                            @RequestAttribute(RequireLoginInterceptor.CALLER_ATTRIBUTE) Caller caller){
        return Mono.just(inviteService.getInvites(eventId, caller));
    }

    @GetMapping("/me/invites")
    public Mono<List<MyInviteDto>> getMyInvites(@RequestAttribute(RequireLoginInterceptor.CALLER_ATTRIBUTE) Caller caller){
        return Mono.just(inviteService.getMyInvites(caller));
    }

    @PostMapping("/me/invites/{inviteId}/accept")
    public Mono<EventDto> accept(@PathVariable("inviteId") Long inviteId,
                                 @RequestAttribute(RequireLoginInterceptor.CALLER_ATTRIBUTE) Caller caller){
        return Mono.just(inviteService.accept(inviteId, caller));
    }

    @PostMapping("/me/invites/{inviteId}/decline")
    public Mono<Void> decline(@PathVariable("inviteId") Long inviteId,
                              @RequestAttribute(RequireLoginInterceptor.CALLER_ATTRIBUTE) Caller caller,
                              @RequestBody(required = false) DeclineInviteRequest request){
        inviteService.decline(inviteId, request != null && request.isMuteOrganizer(), caller);
        return Mono.empty();
    }
}
