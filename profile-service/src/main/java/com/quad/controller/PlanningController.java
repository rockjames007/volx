package com.quad.controller;

import com.quad.dto.PlanningDto;
import com.quad.security.Caller;
import com.quad.security.RequireLoginInterceptor;
import com.quad.service.PlanningService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

// Event planning: when matching volunteers are free, and when they've turned up before.
@RestController
@RequestMapping("/profile/planning")
public class PlanningController {

    private final PlanningService planningService;

    public PlanningController(PlanningService planningService) {
        this.planningService = planningService;
    }

    @GetMapping("/best-times")
    public Mono<PlanningDto> bestTimes(@RequestParam(value = "categoryId", required = false) Long categoryId,
                                       @RequestParam(value = "area", required = false) String area,
                                       @RequestAttribute(RequireLoginInterceptor.CALLER_ATTRIBUTE) Caller caller){
        return Mono.just(planningService.bestTimes(categoryId, area, caller));
    }
}
