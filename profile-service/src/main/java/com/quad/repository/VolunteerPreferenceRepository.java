package com.quad.repository;

import com.quad.entity.VolunteerPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VolunteerPreferenceRepository extends JpaRepository<VolunteerPreference, String> {
    List<VolunteerPreference> findByDiscoverableTrue();
}
