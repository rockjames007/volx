package com.quad.service;

import com.quad.dto.PlanningDto;
import com.quad.security.Caller;

// Helps organizers choose when to hold an event.
public interface PlanningService {
    PlanningDto bestTimes(Long categoryId, String area, Caller organizer);
}
