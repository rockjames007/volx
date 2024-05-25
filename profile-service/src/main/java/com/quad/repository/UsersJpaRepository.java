package com.quad.repository;

import com.quad.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsersJpaRepository extends JpaRepository<Users,Long> {

    Page<Users> findByIsOrgFalseAndIsActiveTrue(Pageable pageable);

    Page<Users> findByIsOrgTrueAndIsActiveTrue(Pageable pageable);

    Optional<Users> findByUserId(Long userId);
}
