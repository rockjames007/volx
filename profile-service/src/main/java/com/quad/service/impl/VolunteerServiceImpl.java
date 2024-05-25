package com.quad.service.impl;

import com.quad.dto.VolunteerDto;
import com.quad.entity.Users;
import com.quad.repository.UsersJpaRepository;
import com.quad.service.VolunteerService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class VolunteerServiceImpl implements VolunteerService {

    @Autowired
    UsersJpaRepository volunteerRepository;
    @Autowired
    ModelMapper modelMapper;

    @Override
    public Page<VolunteerDto> getAllVolunteers(Pageable pageable) {
        Page<Users> volunteerDtos= volunteerRepository.findByIsOrgFalseAndIsActiveTrue(pageable);
        return volunteerDtos.map(user -> modelMapper.map(user, VolunteerDto.class));
    }

    @Override
    public VolunteerDto findVolunteerById(String volunteerId) {
        Optional<Users> volunteerDtos= volunteerRepository.findByUserId(Long.valueOf(volunteerId));
        if(volunteerDtos.isPresent()) {
            Users user = volunteerDtos.get();
            return modelMapper.map(user, VolunteerDto.class);
        }else{
            return null;
        }
    }
}
