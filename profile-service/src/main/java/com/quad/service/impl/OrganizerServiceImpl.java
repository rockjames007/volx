package com.quad.service.impl;

import com.quad.dto.OrganizerDto;
import com.quad.dto.VolunteerDto;
import com.quad.entity.Users;
import com.quad.repository.UsersJpaRepository;
import com.quad.service.OrganizerService;
import com.quad.service.VolunteerService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class OrganizerServiceImpl implements OrganizerService {

    @Autowired
    UsersJpaRepository organizerRepository;
    @Autowired
    ModelMapper modelMapper;

    @Override
    public Page<OrganizerDto> getAllOrganizers(Pageable pageable) {
        Page<Users> volunteerDtos= organizerRepository.findByIsOrgTrueAndIsActiveTrue(pageable);
        return volunteerDtos.map(user -> modelMapper.map(user, OrganizerDto.class));
    }

    @Override
    public OrganizerDto findOrganizerById(String organizerId) {
        Optional<Users> volunteerDtos= organizerRepository.findByUserId(Long.valueOf(organizerId));
        if(volunteerDtos.isPresent()) {
            Users user = volunteerDtos.get();
            return modelMapper.map(user, OrganizerDto.class);
        }else{
            return null;
        }
    }
}
