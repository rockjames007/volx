package com.quad.service;

import com.quad.dto.VolunteerDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface VolunteerService {

    Page<VolunteerDto> getAllVolunteers(Pageable pageable);

    VolunteerDto findVolunteerById(String volunteerId);
}
