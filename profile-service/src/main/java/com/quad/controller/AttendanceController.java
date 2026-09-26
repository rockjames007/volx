package com.quad.controller;

import com.quad.dto.AttendanceUpdateRequest;
import com.quad.dto.CheckInCodeDto;
import com.quad.dto.CheckInRequest;
import com.quad.dto.CheckInResultDto;
import com.quad.dto.HoursEntryDto;
import com.quad.dto.HoursRecordDto;
import com.quad.dto.VolunteerSignupDto;
import com.quad.security.Caller;
import com.quad.security.RequireLoginInterceptor;
import com.quad.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

// QR check-in, attendance and verified hours.
@RestController
@RequestMapping("/profile")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/events/{eventId}/check-in-code")
    public Mono<CheckInCodeDto> getCheckInCode(@PathVariable("eventId") String eventId,
                                               @RequestAttribute(RequireLoginInterceptor.CALLER_ATTRIBUTE) Caller caller){
        return Mono.just(attendanceService.getCheckInCode(eventId, caller));
    }

    @PostMapping("/events/{eventId}/check-in")
    public Mono<CheckInResultDto> checkIn(@PathVariable("eventId") String eventId,
                                          @RequestAttribute(RequireLoginInterceptor.CALLER_ATTRIBUTE) Caller caller,
                                          @Valid @RequestBody CheckInRequest request){
        return Mono.just(attendanceService.checkIn(eventId, request.getCode(), caller));
    }

    @PutMapping("/events/{eventId}/volunteers/{username}/attendance")
    public Mono<VolunteerSignupDto> updateAttendance(@PathVariable("eventId") String eventId,
                                                     @PathVariable("username") String username,
                                                     @RequestAttribute(RequireLoginInterceptor.CALLER_ATTRIBUTE) Caller caller,
                                                     @Valid @RequestBody AttendanceUpdateRequest request){
        return Mono.just(attendanceService.updateAttendance(eventId, username, request, caller));
    }

    @GetMapping("/me/hours")
    public Mono<HoursRecordDto> getMyHours(@RequestAttribute(RequireLoginInterceptor.CALLER_ATTRIBUTE) Caller caller){
        return Mono.just(attendanceService.getMyHours(caller));
    }

    // Public: lets a school or employer confirm a certificate is genuine.
    @GetMapping("/verify/{verificationCode}")
    public Mono<HoursEntryDto> verify(@PathVariable("verificationCode") String verificationCode){
        return Mono.just(attendanceService.verify(verificationCode));
    }
}
