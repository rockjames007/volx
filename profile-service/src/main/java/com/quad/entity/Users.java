package com.quad.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;
    private String name;
    private String gender;
    private Boolean isOrg;
    private Boolean isActive;
    @OneToOne(cascade = CascadeType.ALL)
    private Image profileImage;
    @OneToOne(cascade = CascadeType.ALL)
    private Address address;
    private Integer points;
    private LocalDateTime createdDate;
}
