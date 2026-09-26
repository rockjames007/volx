package com.quad.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serial;
import java.util.Date;

@Table(name = "users")
@Entity
@Data
public class User {
    @Serial
    private static final long serialVersionUID = -6333013113362180294L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, length = 100, nullable = false)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    // Nullable so accounts created before roles existed still load; they count as volunteers.
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Role role;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "organization_name", length = 120)
    private String organizationName;

    public Role getRole() {
        return role == null ? Role.VOLUNTEER : role;
    }

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private Date createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Date updatedAt;
}
