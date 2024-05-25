package com.quad.service;

import com.quad.dto.OrganizerDto;
import com.quad.dto.VolunteerDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrganizerService {

    Page<OrganizerDto> getAllOrganizers(Pageable pageable);

    OrganizerDto findOrganizerById(String volunteerId);
}
