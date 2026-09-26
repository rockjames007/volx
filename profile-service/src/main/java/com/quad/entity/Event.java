package com.quad.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Formula;

import java.time.LocalDateTime;

@Entity
@Data
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(length = 2000)
    private String description;
    @Column(insertable = false, updatable = false)
    private Long categoryId;
    @ManyToOne
    @JoinColumn(name = "categoryId", referencedColumnName = "id")
    private Category category;
    @OneToOne(cascade = CascadeType.ALL)
    private Address address;
    @OneToOne(cascade = CascadeType.ALL)
    private Image bgImage;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private Boolean isActive;
    private Integer noOfParticipant;
    private String createdBy;
    // Shown as "Organized by …"; the organization's name at the time the event was posted.
    private String organizerName;
    // Secret in the check-in QR code; only the organizer can see it.
    @Column(length = 12)
    private String checkInCode;
    @Formula("(select count(*) from event_registration r where r.event_id = id)")
    private Integer volunteersJoined;
    private LocalDateTime createdDate;
}
